package storage

import (
	"bytes"
	"context"
	"fmt"
	"log/slog"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

// DefaultPresignTTL controls how long generated download URLs stay valid.
// 1 hour is a reasonable default — long enough for a user to click through
// the UI, short enough that leaked URLs auto-expire. Override via env var
// S3_PRESIGN_TTL_SECONDS if a different value is needed.
const DefaultPresignTTL = 1 * time.Hour

// Client wraps the S3 SDK with a few project-specific helpers.
type Client struct {
	api    *s3.Client
	bucket string
}

var (
	defaultOnce sync.Once
	defaultC    *Client
)

// Default lazily constructs the S3 client. Returns nil if AWS credentials or
// bucket are not configured — callers should treat S3 as optional.
func Default() *Client {
	defaultOnce.Do(func() {
		bucket := os.Getenv("S3_BUCKET")
		region := os.Getenv("AWS_REGION")
		if bucket == "" || region == "" {
			slog.Info("storage disabled: S3_BUCKET or AWS_REGION not set")
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		cfg, err := awsconfig.LoadDefaultConfig(ctx, awsconfig.WithRegion(region))
		if err != nil {
			slog.Warn("storage disabled: aws config", "err", err)
			return
		}
		defaultC = &Client{api: s3.NewFromConfig(cfg), bucket: bucket}
		slog.Info("storage enabled", "bucket", bucket, "region", region)
	})
	return defaultC
}

// UploadContent writes the markdown content for a generated piece to S3 and
// returns the **object key** (e.g. "content/<projectId>/<contentId>.md").
// Buckets are now private by default, so we no longer return a raw HTTPS URL
// — callers should pass the key to PresignDownload to get a time-limited
// signed URL the browser can open. Returns "" if S3 is not configured or
// upload fails (failures are logged, not propagated, so the pipeline always
// succeeds even when storage is offline).
func UploadContent(ctx context.Context, projectID, contentID, markdown string) string {
	c := Default()
	if c == nil {
		return ""
	}

	key := fmt.Sprintf("content/%s/%s.md", projectID, contentID)
	_, err := c.api.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(c.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader([]byte(markdown)),
		ContentType: aws.String("text/markdown; charset=utf-8"),
	})
	if err != nil {
		slog.Warn("s3 upload failed", "key", key, "err", err)
		return ""
	}

	slog.Info("s3 upload ok", "key", key, "bucket", c.bucket)
	return key
}

// PresignDownload returns a time-limited HTTPS URL the browser can open to
// download the object directly from S3 without exposing AWS credentials.
// `keyOrLegacyURL` accepts either a bare key ("content/p/c.md") or a legacy
// full S3 URL stored before we switched to keys (we extract the path).
func PresignDownload(ctx context.Context, keyOrLegacyURL string) (string, error) {
	c := Default()
	if c == nil {
		return "", fmt.Errorf("storage not configured")
	}
	if keyOrLegacyURL == "" {
		return "", fmt.Errorf("empty key")
	}

	key := normalizeKey(keyOrLegacyURL)
	ttl := DefaultPresignTTL
	if v := os.Getenv("S3_PRESIGN_TTL_SECONDS"); v != "" {
		if n, err := time.ParseDuration(v + "s"); err == nil && n > 0 {
			ttl = n
		}
	}

	presigner := s3.NewPresignClient(c.api)
	req, err := presigner.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(ttl))
	if err != nil {
		return "", fmt.Errorf("presign: %w", err)
	}
	return req.URL, nil
}

// normalizeKey strips a full https://...amazonaws.com/ prefix if present so
// rows written before we switched to keys still work. Returns the cleaned key.
func normalizeKey(s string) string {
	if !strings.HasPrefix(s, "http://") && !strings.HasPrefix(s, "https://") {
		return s
	}
	// Find ".com/" and take everything after it as the key path.
	if i := strings.Index(s, ".com/"); i != -1 {
		return s[i+len(".com/"):]
	}
	return s
}

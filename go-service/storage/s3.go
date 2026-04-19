package storage

import (
	"bytes"
	"context"
	"fmt"
	"log/slog"
	"os"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

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
// returns its public-style URL. Returns "" if S3 is not configured or upload
// fails (failures are logged, not propagated, so the pipeline always succeeds).
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

	region := os.Getenv("AWS_REGION")
	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", c.bucket, region, key)
	slog.Info("s3 upload ok", "url", url)
	return url
}

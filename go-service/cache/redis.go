package cache

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"log/slog"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

// Cache is a minimal interface so handlers can be tested or run without Redis.
type Cache interface {
	GetJSON(ctx context.Context, key string, dst any) (bool, error)
	SetJSON(ctx context.Context, key string, value any, ttl time.Duration) error
	Delete(ctx context.Context, keys ...string) error
	Enabled() bool
}

// noopCache is used when REDIS_URL is unset so the rest of the system keeps
// working in local development without an extra dependency.
type noopCache struct{}

func (noopCache) GetJSON(context.Context, string, any) (bool, error)      { return false, nil }
func (noopCache) SetJSON(context.Context, string, any, time.Duration) error { return nil }
func (noopCache) Delete(context.Context, ...string) error                   { return nil }
func (noopCache) Enabled() bool                                             { return false }

type redisCache struct {
	client *redis.Client
}

func (r *redisCache) GetJSON(ctx context.Context, key string, dst any) (bool, error) {
	raw, err := r.client.Get(ctx, key).Bytes()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return false, nil
		}
		return false, err
	}
	if err := json.Unmarshal(raw, dst); err != nil {
		return false, err
	}
	return true, nil
}

func (r *redisCache) SetJSON(ctx context.Context, key string, value any, ttl time.Duration) error {
	raw, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return r.client.Set(ctx, key, raw, ttl).Err()
}

func (r *redisCache) Delete(ctx context.Context, keys ...string) error {
	if len(keys) == 0 {
		return nil
	}
	return r.client.Del(ctx, keys...).Err()
}

func (r *redisCache) Enabled() bool { return true }

var (
	defaultOnce  sync.Once
	defaultCache Cache
)

// Default returns a process-wide cache. If REDIS_URL is missing or the ping
// fails, a noop cache is used and the system continues without caching.
func Default() Cache {
	defaultOnce.Do(func() {
		url := os.Getenv("REDIS_URL")
		if url == "" {
			slog.Info("cache disabled: REDIS_URL not set")
			defaultCache = noopCache{}
			return
		}
		opts, err := redis.ParseURL(url)
		if err != nil {
			slog.Warn("cache disabled: bad REDIS_URL", "err", err)
			defaultCache = noopCache{}
			return
		}
		client := redis.NewClient(opts)
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		if err := client.Ping(ctx).Err(); err != nil {
			slog.Warn("cache disabled: redis ping failed", "err", err)
			defaultCache = noopCache{}
			return
		}
		slog.Info("cache enabled", "addr", opts.Addr)
		defaultCache = &redisCache{client: client}
	})
	return defaultCache
}

// HashKey produces a deterministic short cache key from a prefix and the
// provided string parts (order-independent within each call).
func HashKey(prefix string, parts ...string) string {
	sorted := append([]string(nil), parts...)
	sort.Strings(sorted)
	h := sha256.Sum256([]byte(strings.Join(sorted, "|")))
	return prefix + ":" + hex.EncodeToString(h[:8])
}

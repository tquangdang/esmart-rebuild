package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// limiterStore keeps a token-bucket limiter per client IP and lazily evicts
// stale entries to keep memory bounded.
type limiterStore struct {
	mu       sync.Mutex
	rps      rate.Limit
	burst    int
	limiters map[string]*entry
}

type entry struct {
	limiter *rate.Limiter
	seen    time.Time
}

func newLimiterStore(perMinute int, burst int) *limiterStore {
	return &limiterStore{
		rps:      rate.Limit(float64(perMinute) / 60.0),
		burst:    burst,
		limiters: map[string]*entry{},
	}
}

func (s *limiterStore) take(ip string) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if len(s.limiters) > 4096 {
		// Cheap eviction: drop entries unseen for 10 minutes.
		cutoff := time.Now().Add(-10 * time.Minute)
		for k, e := range s.limiters {
			if e.seen.Before(cutoff) {
				delete(s.limiters, k)
			}
		}
	}

	e, ok := s.limiters[ip]
	if !ok {
		e = &entry{limiter: rate.NewLimiter(s.rps, s.burst)}
		s.limiters[ip] = e
	}
	e.seen = time.Now()
	return e.limiter.Allow()
}

// PerIPRateLimiter returns a Gin middleware allowing perMinute requests per IP.
// Excess requests get HTTP 429 with a Retry-After header.
func PerIPRateLimiter(perMinute, burst int) gin.HandlerFunc {
	store := newLimiterStore(perMinute, burst)
	return func(c *gin.Context) {
		if !store.take(c.ClientIP()) {
			c.Header("Retry-After", "60")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error": "rate limit exceeded",
			})
			return
		}
		c.Next()
	}
}

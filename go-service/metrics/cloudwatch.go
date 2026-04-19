package metrics

import (
	"context"
	"log/slog"
	"os"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cloudwatch"
	"github.com/aws/aws-sdk-go-v2/service/cloudwatch/types"
)

const namespace = "EsmartGo"

// publisher batches metric data and flushes every flushInterval to CloudWatch.
// If AWS is not configured, publishing becomes a no-op so local development
// keeps working.
type publisher struct {
	api     *cloudwatch.Client
	mu      sync.Mutex
	pending []types.MetricDatum
}

var (
	once sync.Once
	pub  *publisher
)

const (
	maxBatch      = 20
	flushInterval = 60 * time.Second
)

// Start initializes the publisher and starts the background flusher. Safe to
// call multiple times — only the first call has effect.
func Start() {
	once.Do(func() {
		region := os.Getenv("AWS_REGION")
		if region == "" {
			slog.Info("metrics disabled: AWS_REGION not set")
			pub = &publisher{} // no-op, no api
			return
		}
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		cfg, err := awsconfig.LoadDefaultConfig(ctx, awsconfig.WithRegion(region))
		if err != nil {
			slog.Warn("metrics disabled: aws config", "err", err)
			pub = &publisher{}
			return
		}
		pub = &publisher{api: cloudwatch.NewFromConfig(cfg)}
		slog.Info("metrics enabled", "region", region, "namespace", namespace)
		go pub.runFlush()
	})
}

func (p *publisher) runFlush() {
	t := time.NewTicker(flushInterval)
	defer t.Stop()
	for range t.C {
		p.flush(context.Background())
	}
}

func (p *publisher) flush(ctx context.Context) {
	if p.api == nil {
		return
	}
	p.mu.Lock()
	if len(p.pending) == 0 {
		p.mu.Unlock()
		return
	}
	batch := p.pending
	p.pending = nil
	p.mu.Unlock()

	for i := 0; i < len(batch); i += maxBatch {
		end := i + maxBatch
		if end > len(batch) {
			end = len(batch)
		}
		_, err := p.api.PutMetricData(ctx, &cloudwatch.PutMetricDataInput{
			Namespace:  aws.String(namespace),
			MetricData: batch[i:end],
		})
		if err != nil {
			slog.Warn("cloudwatch put failed", "err", err)
		}
	}
}

func add(name string, value float64, unit types.StandardUnit, dims ...types.Dimension) {
	if pub == nil || pub.api == nil {
		return
	}
	pub.mu.Lock()
	pub.pending = append(pub.pending, types.MetricDatum{
		MetricName: aws.String(name),
		Value:      aws.Float64(value),
		Unit:       unit,
		Dimensions: dims,
		Timestamp:  aws.Time(time.Now()),
	})
	pub.mu.Unlock()
}

// Counter publishes a count metric.
func Counter(name string, n float64, dims ...types.Dimension) {
	add(name, n, types.StandardUnitCount, dims...)
}

// Duration publishes a millisecond timing metric.
func Duration(name string, d time.Duration, dims ...types.Dimension) {
	add(name, float64(d.Milliseconds()), types.StandardUnitMilliseconds, dims...)
}

// Gauge publishes a current-value metric.
func Gauge(name string, v float64, dims ...types.Dimension) {
	add(name, v, types.StandardUnitNone, dims...)
}

// Dim is a small helper for building dimension labels at call sites.
func Dim(name, value string) types.Dimension {
	return types.Dimension{Name: aws.String(name), Value: aws.String(value)}
}

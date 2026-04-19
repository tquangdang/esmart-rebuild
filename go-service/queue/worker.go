package queue

import (
	"context"
	"errors"
	"log/slog"
	"sync"
	"time"

	"esmart-go/agents"
	"esmart-go/config"
	"esmart-go/events"
	"esmart-go/metrics"
	"esmart-go/models"
	"esmart-go/notifications"
	"esmart-go/storage"
)

// Worker is a pool of goroutines consuming jobs from a Queue and running the
// full agent pipeline for each one. Events are published to events.Default
// keyed by job ID; the WebSocket handler subscribes by jobId to forward them.
type Worker struct {
	queue       Queue
	concurrency int
	wg          sync.WaitGroup
	cancel      context.CancelFunc
}

func NewWorker(q Queue, concurrency int) *Worker {
	if concurrency <= 0 {
		concurrency = 3
	}
	return &Worker{queue: q, concurrency: concurrency}
}

// Start launches the worker goroutines. They run until Stop is called or the
// queue is closed.
func (w *Worker) Start() {
	ctx, cancel := context.WithCancel(context.Background())
	w.cancel = cancel

	for i := 0; i < w.concurrency; i++ {
		w.wg.Add(1)
		go w.loop(ctx, i)
	}
	slog.Info("worker pool started", "concurrency", w.concurrency)
}

func (w *Worker) Stop() {
	if w.cancel != nil {
		w.cancel()
	}
	w.wg.Wait()
}

func (w *Worker) loop(ctx context.Context, id int) {
	defer w.wg.Done()
	for {
		job, ack, err := w.queue.Dequeue(ctx)
		if err != nil {
			if errors.Is(err, context.Canceled) {
				return
			}
			slog.Debug("dequeue", "worker", id, "err", err)
			time.Sleep(500 * time.Millisecond)
			continue
		}
		w.process(ctx, job, ack)
	}
}

// process runs one job: updates DB status, publishes events, runs the pipeline,
// persists the resulting Content and uploads the markdown to S3 if configured.
// The bus topic is closed at the end so subscribed websockets terminate cleanly.
func (w *Worker) process(parent context.Context, job Job, ack Ack) {
	defer events.Default.Close(job.ID)

	updateJob(job.ID, map[string]any{"status": models.JobStatusRunning, "currentStep": agents.StepResearch})

	ctx, cancel := context.WithTimeout(parent, 6*time.Minute)
	defer cancel()

	jobStart := time.Now()
	stepStarts := map[string]time.Time{}

	emit := func(e agents.AgentEvent) {
		if e.Step != "" && (e.Status == agents.StatusStarted || e.Status == agents.StatusCacheHit) {
			updateJob(job.ID, map[string]any{"currentStep": e.Step})
			stepStarts[e.Step] = time.Now()
		}
		if e.Status == agents.StatusCompleted || e.Status == agents.StatusSkipped || e.Status == agents.StatusError {
			if start, ok := stepStarts[e.Step]; ok {
				metrics.Duration("AgentDuration", time.Since(start), metrics.Dim("agent", e.Step))
			}
			if e.Status == agents.StatusError {
				metrics.Counter("AgentFailure", 1, metrics.Dim("agent", e.Step))
			} else {
				metrics.Counter("AgentSuccess", 1, metrics.Dim("agent", e.Step))
			}
		}
		if e.Status == agents.StatusCacheHit {
			metrics.Counter("CacheHit", 1, metrics.Dim("agent", e.Step))
		}
		events.Default.Publish(job.ID, events.Envelope{Event: e})
	}

	state, err := agents.Pipeline(ctx, job.Input, emit)
	if err != nil {
		errMsg := err.Error()
		updateJob(job.ID, map[string]any{"status": models.JobStatusFailed, "error": errMsg})
		events.Default.Publish(job.ID, events.Envelope{Error: errMsg})
		metrics.Counter("PipelineFailure", 1)
		metrics.Duration("PipelineDuration", time.Since(jobStart), metrics.Dim("outcome", "failed"))
		_ = ack.Nack(ctx)
		return
	}

	tone := nilIfEmpty(job.Input.Tone)
	keywordCSV := joinCSV(job.Input.Keywords)
	content := models.Content{
		ProjectID:        job.Input.ProjectID,
		Topic:            job.Input.Topic,
		Keywords:         keywordCSV,
		Tone:             tone,
		ContentType:      job.Input.ContentType,
		GeneratedContent: &state.Final,
	}
	if state.SEOReport != nil {
		score := state.SEOReport.Score
		content.SEOScore = &score
	}
	if err := config.DB.Create(&content).Error; err != nil {
		updateJob(job.ID, map[string]any{"status": models.JobStatusFailed, "error": err.Error()})
		events.Default.Publish(job.ID, events.Envelope{Error: "failed to save content"})
		_ = ack.Nack(ctx)
		return
	}

	// Persist the S3 *key* (not URL) so we can re-sign on demand later.
	// The URL we broadcast to the client is freshly presigned with a TTL.
	s3Key := storage.UploadContent(ctx, content.ProjectID, content.ID, state.Final)
	var presignedURL string
	if s3Key != "" {
		content.S3URL = &s3Key
		_ = config.DB.Model(&content).Update("s3Url", s3Key).Error

		if u, err := storage.PresignDownload(ctx, s3Key); err == nil {
			presignedURL = u
		} else {
			slog.Warn("presign download failed", "key", s3Key, "err", err)
		}
	}

	patch := map[string]any{
		"status":      models.JobStatusCompleted,
		"currentStep": agents.StepMeta,
		"contentId":   content.ID,
	}
	if s3Key != "" {
		patch["s3Url"] = s3Key
	}
	updateJob(job.ID, patch)

	notifications.Default.Broadcast(notifications.Notification{
		Type:    "content.generated",
		Title:   "Content Generated",
		Message: "New content: " + content.Topic,
	})

	events.Default.Publish(job.ID, events.Envelope{
		Done:      true,
		Final:     state.Final,
		ContentID: content.ID,
		S3URL:     presignedURL,
		Meta:      state.Meta,
	})
	metrics.Counter("PipelineSuccess", 1)
	metrics.Duration("PipelineDuration", time.Since(jobStart), metrics.Dim("outcome", "success"))
	_ = ack.Ack(ctx)
}

func updateJob(id string, patch map[string]any) {
	if config.DB == nil {
		return
	}
	if err := config.DB.Model(&models.Job{}).Where("id = ?", id).Updates(patch).Error; err != nil {
		slog.Warn("job update failed", "id", id, "err", err)
	}
}

func nilIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

func joinCSV(parts []string) string {
	out := ""
	for i, p := range parts {
		if i > 0 {
			out += ", "
		}
		out += p
	}
	return out
}

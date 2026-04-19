package queue

import (
	"context"
	"encoding/json"

	"esmart-go/agents"
)

// Job is the message that flows through any queue implementation.
type Job struct {
	ID    string                `json:"id"`
	Input agents.PipelineInput  `json:"input"`
}

func (j Job) Marshal() ([]byte, error) { return json.Marshal(j) }

func unmarshalJob(b []byte) (Job, error) {
	var j Job
	if err := json.Unmarshal(b, &j); err != nil {
		return Job{}, err
	}
	return j, nil
}

// Queue is the abstraction the worker pool consumes against. Implementations:
//   - memory.go: in-process buffered channel (default, fastest)
//   - sqs.go: AWS SQS for durability across restarts
type Queue interface {
	Enqueue(ctx context.Context, job Job) error
	// Dequeue blocks until a job is available, ctx is cancelled, or queue closes.
	// Implementations should respect long-poll semantics where possible.
	Dequeue(ctx context.Context) (Job, Ack, error)
	Close() error
}

// Ack lets a worker acknowledge or negatively-acknowledge a delivery. For
// in-memory queues this is a no-op; for SQS it deletes the message or returns
// it to the queue for retry.
type Ack interface {
	Ack(ctx context.Context) error
	Nack(ctx context.Context) error
}

// Default is the process-wide queue, set by main on startup. Handlers reach
// the queue through this rather than through DI plumbing.
var Default Queue

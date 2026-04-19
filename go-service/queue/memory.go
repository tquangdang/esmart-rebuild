package queue

import (
	"context"
	"errors"
	"sync"
)

// MemoryQueue is a buffered-channel implementation. Jobs are lost on process
// restart; suitable for development and tests. For production, use SQS.
type MemoryQueue struct {
	ch     chan Job
	closed bool
	mu     sync.Mutex
}

func NewMemoryQueue(buffer int) *MemoryQueue {
	if buffer <= 0 {
		buffer = 64
	}
	return &MemoryQueue{ch: make(chan Job, buffer)}
}

func (q *MemoryQueue) Enqueue(ctx context.Context, job Job) error {
	q.mu.Lock()
	if q.closed {
		q.mu.Unlock()
		return errors.New("queue closed")
	}
	q.mu.Unlock()

	select {
	case q.ch <- job:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

type memoryAck struct{}

func (memoryAck) Ack(context.Context) error  { return nil }
func (memoryAck) Nack(context.Context) error { return nil }

func (q *MemoryQueue) Dequeue(ctx context.Context) (Job, Ack, error) {
	select {
	case job, ok := <-q.ch:
		if !ok {
			return Job{}, nil, errors.New("queue closed")
		}
		return job, memoryAck{}, nil
	case <-ctx.Done():
		return Job{}, nil, ctx.Err()
	}
}

func (q *MemoryQueue) Close() error {
	q.mu.Lock()
	defer q.mu.Unlock()
	if q.closed {
		return nil
	}
	q.closed = true
	close(q.ch)
	return nil
}

// Depth returns the current queue depth (used by metrics).
func (q *MemoryQueue) Depth() int { return len(q.ch) }

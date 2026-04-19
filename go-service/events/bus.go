package events

import (
	"sync"

	"esmart-go/agents"
)

// Envelope wraps an AgentEvent with terminal markers so subscribers know when
// the job is fully done (success or error) without inferring from event types.
type Envelope struct {
	Event    agents.AgentEvent
	Done     bool
	Error    string
	ContentID string
	S3URL     string
	Final    string
	Meta     *agents.MetaPackage
}

// Bus is a per-job event fan-out. The queue worker publishes events; one or
// more WebSocket subscribers read them. Buffered channels (size 64) absorb the
// burst of writer-token events without blocking the producer.
type Bus struct {
	mu     sync.RWMutex
	topics map[string][]chan Envelope
}

func NewBus() *Bus {
	return &Bus{topics: map[string][]chan Envelope{}}
}

// Subscribe returns a channel that receives all subsequent events for the job.
// The channel is closed when Close(jobID) is called.
func (b *Bus) Subscribe(jobID string) <-chan Envelope {
	ch := make(chan Envelope, 64)
	b.mu.Lock()
	b.topics[jobID] = append(b.topics[jobID], ch)
	b.mu.Unlock()
	return ch
}

// Unsubscribe removes one specific subscriber channel.
func (b *Bus) Unsubscribe(jobID string, target <-chan Envelope) {
	b.mu.Lock()
	defer b.mu.Unlock()
	subs := b.topics[jobID]
	for i, ch := range subs {
		if ch == target {
			b.topics[jobID] = append(subs[:i], subs[i+1:]...)
			break
		}
	}
}

// Publish sends an envelope to every subscriber. Slow consumers are dropped
// by best-effort non-blocking send to keep the producer moving.
func (b *Bus) Publish(jobID string, env Envelope) {
	b.mu.RLock()
	subs := append([]chan Envelope(nil), b.topics[jobID]...)
	b.mu.RUnlock()
	for _, ch := range subs {
		select {
		case ch <- env:
		default:
		}
	}
}

// Close finalizes a job: closes every subscriber channel and forgets the topic.
func (b *Bus) Close(jobID string) {
	b.mu.Lock()
	subs := b.topics[jobID]
	delete(b.topics, jobID)
	b.mu.Unlock()
	for _, ch := range subs {
		close(ch)
	}
}

// Default is a process-wide shared bus.
var Default = NewBus()

package queue

import (
	"context"
	"errors"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sqs"
)

// SQSQueue is the AWS SQS-backed Queue implementation. Long-polls for new
// messages and uses a 5-minute visibility timeout (longer than the worst-case
// agent pipeline). Failed jobs are returned to the queue and eventually move
// to the configured Dead-Letter Queue after maxReceiveCount attempts (set on
// the queue itself, not in code).
type SQSQueue struct {
	api      *sqs.Client
	queueURL string
}

func NewSQSQueue() (*SQSQueue, error) {
	queueURL := os.Getenv("SQS_QUEUE_URL")
	region := os.Getenv("AWS_REGION")
	if queueURL == "" || region == "" {
		return nil, errors.New("SQS_QUEUE_URL and AWS_REGION required")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	cfg, err := awsconfig.LoadDefaultConfig(ctx, awsconfig.WithRegion(region))
	if err != nil {
		return nil, err
	}
	return &SQSQueue{api: sqs.NewFromConfig(cfg), queueURL: queueURL}, nil
}

func (q *SQSQueue) Enqueue(ctx context.Context, job Job) error {
	body, err := job.Marshal()
	if err != nil {
		return err
	}
	_, err = q.api.SendMessage(ctx, &sqs.SendMessageInput{
		QueueUrl:    aws.String(q.queueURL),
		MessageBody: aws.String(string(body)),
	})
	return err
}

type sqsAck struct {
	api      *sqs.Client
	queueURL string
	receipt  string
}

func (a sqsAck) Ack(ctx context.Context) error {
	_, err := a.api.DeleteMessage(ctx, &sqs.DeleteMessageInput{
		QueueUrl:      aws.String(a.queueURL),
		ReceiptHandle: aws.String(a.receipt),
	})
	return err
}

func (a sqsAck) Nack(ctx context.Context) error {
	// Setting visibility to 0 returns the message immediately for retry.
	_, err := a.api.ChangeMessageVisibility(ctx, &sqs.ChangeMessageVisibilityInput{
		QueueUrl:          aws.String(a.queueURL),
		ReceiptHandle:     aws.String(a.receipt),
		VisibilityTimeout: 0,
	})
	return err
}

func (q *SQSQueue) Dequeue(ctx context.Context) (Job, Ack, error) {
	out, err := q.api.ReceiveMessage(ctx, &sqs.ReceiveMessageInput{
		QueueUrl:            aws.String(q.queueURL),
		MaxNumberOfMessages: 1,
		WaitTimeSeconds:     20, // long-poll
		VisibilityTimeout:   300,
	})
	if err != nil {
		return Job{}, nil, err
	}
	if len(out.Messages) == 0 {
		return Job{}, nil, context.DeadlineExceeded
	}

	m := out.Messages[0]
	job, err := unmarshalJob([]byte(aws.ToString(m.Body)))
	if err != nil {
		// Malformed message — delete it so it doesn't block the queue forever.
		_, _ = q.api.DeleteMessage(ctx, &sqs.DeleteMessageInput{
			QueueUrl:      aws.String(q.queueURL),
			ReceiptHandle: m.ReceiptHandle,
		})
		return Job{}, nil, err
	}
	return job, sqsAck{api: q.api, queueURL: q.queueURL, receipt: aws.ToString(m.ReceiptHandle)}, nil
}

func (q *SQSQueue) Close() error { return nil }

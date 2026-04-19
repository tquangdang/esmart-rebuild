import { useState, useCallback, useRef } from 'react'

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

const STEPS = ['research', 'writer', 'seo', 'editor', 'meta']

const initialAgentSteps = () =>
  STEPS.reduce((acc, step) => {
    acc[step] = { status: 'pending', message: '', data: null }
    return acc
  }, {})

export default function useContentStream() {
  const [streamedContent, setStreamedContent] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamDone, setStreamDone] = useState(false)
  const [contentId, setContentId] = useState(null)
  const [agentSteps, setAgentSteps] = useState(initialAgentSteps())
  const [meta, setMeta] = useState(null)
  const [s3Url, setS3Url] = useState(null)
  const wsRef = useRef(null)

  const updateStep = useCallback((step, partial) => {
    setAgentSteps((prev) => ({
      ...prev,
      [step]: { ...prev[step], ...partial },
    }))
  }, [])

  const handleMessage = useCallback((msg, resolve, reject, ws) => {
    switch (msg.type) {
      case 'subscribed':
      case 'start':
        return

      case 'token':
        // Legacy single-stream protocol kept for backward compatibility.
        setStreamedContent((prev) => prev + msg.token)
        return

      case 'agent_step':
        if (msg.step) updateStep(msg.step, { status: 'running', message: msg.message || '' })
        return

      case 'agent_progress':
        if (msg.step === 'writer' && msg.token) {
          setStreamedContent((prev) => prev + msg.token)
          updateStep('writer', { status: 'running' })
        }
        return

      case 'agent_completed':
        if (msg.step) updateStep(msg.step, { status: 'done', message: msg.message || '', data: msg.data || null })
        return

      case 'agent_skipped':
        if (msg.step) updateStep(msg.step, { status: 'skipped', message: msg.message || '' })
        return

      case 'cache_hit':
        if (msg.step) updateStep(msg.step, { status: 'cache', message: msg.message || 'cached' })
        return

      case 'agent_error':
        if (msg.step) updateStep(msg.step, { status: 'error', message: msg.message || '' })
        return

      case 'done':
        setStreamDone(true)
        setStreaming(false)
        setContentId(msg.id || null)
        if (msg.meta) setMeta(msg.meta)
        if (msg.s3Url) setS3Url(msg.s3Url)
        if (msg.content) setStreamedContent(msg.content)
        ws.close()
        resolve({ content: msg.content, id: msg.id, meta: msg.meta, s3Url: msg.s3Url })
        return

      case 'error':
        setStreaming(false)
        ws.close()
        reject(new Error(msg.error || 'pipeline error'))
        return

      default:
        return
    }
  }, [updateStep])

  const startStream = useCallback((payload, opts = {}) => {
    return new Promise((resolve, reject) => {
      setStreamedContent('')
      setStreaming(true)
      setStreamDone(false)
      setContentId(null)
      setAgentSteps(initialAgentSteps())
      setMeta(null)
      setS3Url(null)

      const url = opts.jobId
        ? `${WS_BASE}/ws/generate?jobId=${encodeURIComponent(opts.jobId)}`
        : `${WS_BASE}/ws/generate`
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        if (!opts.jobId) {
          ws.send(JSON.stringify(payload))
        }
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          handleMessage(msg, resolve, reject, ws)
        } catch (err) {
          console.warn('ws parse error', err)
        }
      }

      ws.onerror = () => {
        setStreaming(false)
        reject(new Error('WebSocket connection failed'))
      }

      ws.onclose = () => {
        wsRef.current = null
      }
    })
  }, [handleMessage])

  const cancelStream = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setStreaming(false)
  }, [])

  const resetStream = useCallback(() => {
    setStreamedContent('')
    setStreamDone(false)
    setContentId(null)
    setAgentSteps(initialAgentSteps())
    setMeta(null)
    setS3Url(null)
  }, [])

  return {
    streamedContent,
    streaming,
    streamDone,
    contentId,
    agentSteps,
    meta,
    s3Url,
    startStream,
    cancelStream,
    resetStream,
  }
}

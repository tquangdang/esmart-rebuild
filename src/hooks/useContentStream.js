import { useState, useCallback, useRef } from 'react'

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

export default function useContentStream() {
  const [streamedContent, setStreamedContent] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamDone, setStreamDone] = useState(false)
  const [contentId, setContentId] = useState(null)
  const wsRef = useRef(null)

  const startStream = useCallback((payload) => {
    return new Promise((resolve, reject) => {
      setStreamedContent('')
      setStreaming(true)
      setStreamDone(false)
      setContentId(null)

      const ws = new WebSocket(`${WS_BASE}/ws/generate`)
      wsRef.current = ws

      ws.onopen = () => {
        ws.send(JSON.stringify(payload))
      }

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data)

        if (msg.type === 'token') {
          setStreamedContent((prev) => prev + msg.token)
        } else if (msg.type === 'done') {
          setStreamDone(true)
          setStreaming(false)
          setContentId(msg.id)
          ws.close()
          resolve({ content: msg.content, id: msg.id })
        } else if (msg.type === 'error') {
          setStreaming(false)
          ws.close()
          reject(new Error(msg.error))
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
  }, [])

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
  }, [])

  return {
    streamedContent,
    streaming,
    streamDone,
    contentId,
    startStream,
    cancelStream,
    resetStream,
  }
}

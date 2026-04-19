import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  markAllRead: () => {},
  clearAll: () => {},
})

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const wsRef = useRef(null)

  useEffect(() => {
    let closed = false
    let reconnectTimer = null

    const connect = () => {
      const ws = new WebSocket(`${WS_BASE}/ws/notifications`)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data)
          setNotifications((prev) => [notification, ...prev].slice(0, 50))
          setUnreadCount((prev) => prev + 1)
        } catch (err) {
          console.error('Failed to parse notification:', err)
        }
      }

      ws.onclose = () => {
        if (!closed) {
          reconnectTimer = setTimeout(connect, 3000)
        }
      }

      ws.onerror = () => {
        // onclose will fire next; reconnect logic lives there
      }
    }

    connect()

    return () => {
      closed = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  const markAllRead = useCallback(() => setUnreadCount(0), [])
  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)

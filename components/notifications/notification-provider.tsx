"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { toast } from "@/hooks/use-toast"
import type { RealtimeAlert, NotificationSettings } from "@/lib/types/coastal"

interface NotificationContextType {
  settings: NotificationSettings
  updateSettings: (settings: Partial<NotificationSettings>) => void
  alerts: RealtimeAlert[]
  acknowledgeAlert: (alertId: string) => void
  clearAllAlerts: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    browserNotifications: false,
    soundAlerts: true,
    criticalOnly: false,
  })
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([])

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          setSettings((prev) => ({ ...prev, browserNotifications: true }))
        }
      })
    }
  }, [])

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("coastal-notification-settings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings((prev) => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error("Failed to parse notification settings:", error)
      }
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("coastal-notification-settings", JSON.stringify(settings))
  }, [settings])

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const playAlertSound = (severity: string) => {
    if (!settings.soundAlerts) return

    try {
      // Simple beep using Web Audio API (no placeholder assets)
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      let frequency = 900
      let duration = 0.25
      if (severity === "critical") {
        frequency = 1300
        duration = 0.5
      } else if (severity === "high") {
        frequency = 1100
        duration = 0.35
      }

      osc.frequency.setValueAtTime(frequency, ctx.currentTime)
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
      osc.start()
      osc.stop(ctx.currentTime + duration)
    } catch (error) {
      console.error("Error playing alert sound:", error)
    }
  }

  const showBrowserNotification = (alert: RealtimeAlert) => {
    if (!settings.browserNotifications || Notification.permission !== "granted") return

    const severity = alert.alert?.severity || "medium"
    if (settings.criticalOnly && severity !== "critical") return

    const notification = new Notification("Coastal Threat Alert", {
      body: alert.alert?.message || "New alert detected",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: alert.id,
      requireInteraction: severity === "critical",
    })

    notification.onclick = () => {
      window.focus()
      acknowledgeAlert(alert.id)
      notification.close()
    }

    // Auto-close after 10 seconds for non-critical alerts
    if (severity !== "critical") {
      setTimeout(() => notification.close(), 10000)
    }
  }

  const addAlert = (alert: RealtimeAlert) => {
    setAlerts((prev) => [alert, ...prev.slice(0, 49)]) // Keep last 50 alerts

    // Show toast notification
    const severity = alert.alert?.severity || "medium"
    const variant = severity === "critical" ? "destructive" : "default"

    toast({
      title: "New Alert",
      description: alert.alert?.message || "Alert detected",
      variant,
      duration: severity === "critical" ? 0 : 5000, // Critical alerts don't auto-dismiss
    })

    // Play sound
    playAlertSound(severity)

    // Show browser notification
    showBrowserNotification(alert)
  }

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)))
  }

  const clearAllAlerts = () => {
    setAlerts([])
  }

  // Real-time alerts should arrive via server events/WebSocket in production

  return (
    <NotificationContext.Provider
      value={{
        settings,
        updateSettings,
        alerts,
        acknowledgeAlert,
        clearAllAlerts,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

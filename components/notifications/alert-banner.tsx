"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X, Volume2 } from "lucide-react"
import { useNotifications } from "./notification-provider"

export function AlertBanner() {
  const { alerts, acknowledgeAlert } = useNotifications()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  // Get the most recent critical alert that hasn't been acknowledged or dismissed
  const criticalAlert = alerts.find(
    (alert) => alert.alert?.severity === "critical" && !alert.acknowledged && !dismissed.has(alert.id),
  )

  const handleDismiss = (alertId: string) => {
    setDismissed((prev) => new Set([...prev, alertId]))
  }

  const handleAcknowledge = (alertId: string) => {
    acknowledgeAlert(alertId)
    setDismissed((prev) => new Set([...prev, alertId]))
  }

  // Clear dismissed alerts periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setDismissed(new Set())
    }, 300000) // Clear every 5 minutes

    return () => clearInterval(interval)
  }, [])

  if (!criticalAlert) return null

  return (
    <div className="sticky top-16 z-40 w-full">
      <Alert variant="destructive" className="rounded-none border-x-0 animate-pulse">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <p className="font-medium">{criticalAlert.alert?.message}</p>
              <p className="text-sm opacity-90">
                {criticalAlert.alert?.coastal_sensors?.name} - {criticalAlert.alert?.coastal_sensors?.location}
              </p>
            </div>
            <Volume2 className="h-4 w-4 animate-bounce" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAcknowledge(criticalAlert.id)}
              className="bg-destructive-foreground text-destructive hover:bg-destructive-foreground/90"
            >
              Acknowledge
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss(criticalAlert.id)}
              className="text-destructive-foreground hover:bg-destructive-foreground/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}

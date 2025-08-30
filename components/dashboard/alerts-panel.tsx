"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { fetchAlerts, updateAlert } from "@/lib/api/coastal"
import type { AnomalyAlert } from "@/lib/types/coastal"

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await fetchAlerts({ resolved: false, limit: 10 })
        setAlerts(data)
      } catch (error) {
        console.error("Failed to load alerts:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
    const interval = setInterval(loadAlerts, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const handleResolveAlert = async (alertId: string) => {
    try {
      await updateAlert(alertId, true)
      setAlerts(alerts.filter((alert) => alert.id !== alertId))
    } catch (error) {
      console.error("Failed to resolve alert:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "secondary"
      case "medium":
        return "default"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return AlertTriangle
      default:
        return Clock
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-secondary" />
          Active Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 bg-muted rounded-lg animate-pulse">
                <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-chart-3 mx-auto mb-3" />
            <p className="text-muted-foreground">No active alerts</p>
            <p className="text-sm text-muted-foreground">All systems operating normally</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => {
              const SeverityIcon = getSeverityIcon(alert.severity)

              return (
                <div key={alert.id} className="p-4 bg-muted/50 rounded-lg border border-border/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <SeverityIcon className="h-4 w-4 text-secondary mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-medium text-card-foreground text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.coastal_sensors?.name} - {alert.coastal_sensors?.location}
                        </p>
                        <p className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs">
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>

                  {alert.threshold_value && alert.actual_value && (
                    <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                      Threshold: {alert.threshold_value} | Actual: {alert.actual_value}
                    </div>
                  )}

                  <Button size="sm" variant="outline" onClick={() => handleResolveAlert(alert.id)} className="w-full">
                    <CheckCircle className="h-3 w-3 mr-2" />
                    Mark as Resolved
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

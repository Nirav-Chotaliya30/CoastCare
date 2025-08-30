"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, CheckCircle } from "lucide-react"
import { fetchAlerts } from "@/lib/api/coastal"
import type { AnomalyAlert } from "@/lib/types/coastal"

export function RecentAlerts() {
  const [alerts, setAlerts] = useState<AnomalyAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await fetchAlerts({ limit: 15 })
        setAlerts(data)
      } catch (error) {
        console.error("Failed to load recent alerts:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAlerts()
    const interval = setInterval(loadAlerts, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

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

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-muted rounded animate-pulse">
                <div className="h-3 bg-muted-foreground/20 rounded w-2/3"></div>
                <div className="h-3 bg-muted-foreground/20 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {alert.is_resolved && <CheckCircle className="h-3 w-3 text-chart-3 flex-shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-card-foreground truncate">{alert.coastal_sensors?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleDateString()}{" "}
                      {new Date(alert.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <Badge variant={getSeverityColor(alert.severity) as any} className="text-xs flex-shrink-0 ml-2">
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

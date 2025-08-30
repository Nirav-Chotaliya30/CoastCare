"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Wifi, WifiOff, Cloud, CloudOff } from "lucide-react"
import { ingestOpenWeather } from "@/lib/api/coastal"

interface IngestionStatus {
  lastUpdate: string | null
  isRunning: boolean
  success: boolean
  error?: string
  summary?: {
    coordinates_processed: number
    coordinates_successful: number
    total_readings_inserted: number
    total_alerts_generated: number
  }
}

export function RealTimeStatus() {
  const [status, setStatus] = useState<IngestionStatus>({
    lastUpdate: null,
    isRunning: false,
    success: false
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const triggerIngestion = async () => {
    if (status.isRunning) return

    setIsRefreshing(true)
    setStatus(prev => ({ ...prev, isRunning: true, error: undefined }))

    try {
      const response = await fetch("/api/ingest/openweather", { method: "POST" })
      const data = await response.json()

      if (response.ok && data.success) {
        setStatus({
          lastUpdate: new Date().toISOString(),
          isRunning: false,
          success: true,
          summary: data.summary
        })
      } else {
        setStatus({
          lastUpdate: new Date().toISOString(),
          isRunning: false,
          success: false,
          error: data.error || data.message || "Unknown error"
        })
      }
    } catch (error) {
      setStatus({
        lastUpdate: new Date().toISOString(),
        isRunning: false,
        success: false,
        error: error instanceof Error ? error.message : "Network error"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Trigger initial ingestion on component mount
    triggerIngestion()

    // Set up automatic refresh every 5 minutes
    const interval = setInterval(triggerIngestion, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    if (status.isRunning) {
      return <RefreshCw className="h-4 w-4 animate-spin" />
    }
    if (status.success) {
      return <Wifi className="h-4 w-4 text-green-500" />
    }
    return <WifiOff className="h-4 w-4 text-red-500" />
  }

  const getStatusColor = () => {
    if (status.isRunning) return "bg-yellow-500"
    if (status.success) return "bg-green-500"
    return "bg-red-500"
  }

  const getStatusText = () => {
    if (status.isRunning) return "Updating..."
    if (status.success) return "Connected"
    return "Disconnected"
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Real-Time Data Status
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={triggerIngestion}
            disabled={status.isRunning || isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">OpenWeather API</span>
          </div>
          <Badge variant={status.success ? "default" : "destructive"}>
            {getStatusText()}
          </Badge>
        </div>

        {/* Last Update */}
        {status.lastUpdate && (
          <div className="text-xs text-muted-foreground">
            Last update: {new Date(status.lastUpdate).toLocaleString()}
          </div>
        )}

        {/* Error Message */}
        {status.error && (
          <div className="text-xs text-red-500 bg-red-50 p-2 rounded">
            Error: {status.error}
          </div>
        )}

        {/* Summary Stats */}
        {status.summary && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {status.summary.coordinates_successful}/{status.summary.coordinates_processed}
              </div>
              <div className="text-xs text-muted-foreground">Locations</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary">
                {status.summary.total_readings_inserted}
              </div>
              <div className="text-xs text-muted-foreground">Readings</div>
            </div>
            {status.summary.total_alerts_generated > 0 && (
              <div className="col-span-2 text-center">
                <div className="text-sm font-medium text-orange-600">
                  {status.summary.total_alerts_generated} alerts generated
                </div>
              </div>
            )}
          </div>
        )}

        {/* Auto-refresh indicator */}
        <div className="text-xs text-muted-foreground text-center">
          Auto-refreshes every 5 minutes
        </div>
      </CardContent>
    </Card>
  )
}

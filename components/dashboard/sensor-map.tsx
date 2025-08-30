"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Thermometer, Waves, Wind, Gauge, Clock } from "lucide-react"
import { realtimeDataService, type RealtimeData } from "@/lib/websocket/client"
import type { SensorReading } from "@/lib/types/coastal"

export function SensorMap() {
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>("")

  useEffect(() => {
    const unsubscribe = realtimeDataService.subscribe((data: RealtimeData) => {
      setReadings(data.readings)
      setLastUpdate(data.timestamp)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "wind_speed":
        return Wind
      case "temperature":
        return Thermometer
      case "wave_height":
        return Waves
      default:
        return MapPin
    }
  }

  const getSensorColor = (type: string, value: number) => {
    switch (type) {
      case "wind_speed":
        return value > 20 ? "text-destructive" : value > 15 ? "text-orange-500" : "text-green-500"
      case "temperature":
        return value > 35 ? "text-destructive" : value > 25 ? "text-orange-500" : value < 10 ? "text-blue-500" : "text-green-500"
      case "wave_height":
        return value > 4 ? "text-destructive" : value > 2.5 ? "text-orange-500" : "text-blue-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getSensorTypeLabel = (type: string) => {
    switch (type) {
      case "wind_speed":
        return "Wind Speed"
      case "temperature":
        return "Temperature"
      case "wave_height":
        return "Wave Height"
      default:
        return type.replace("_", " ")
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Real-Time Sensor Network
          </div>
          {lastUpdate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTimestamp(lastUpdate)}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg animate-pulse">
                <div className="h-4 bg-muted-foreground/20 rounded w-1/3"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {readings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No sensor data available</p>
              </div>
            ) : (
              readings.map((reading) => {
                const Icon = getSensorIcon(reading.coastal_sensors?.sensor_type || "")
                const colorClass = getSensorColor(reading.coastal_sensors?.sensor_type || "", reading.value)
                const typeLabel = getSensorTypeLabel(reading.coastal_sensors?.sensor_type || "")

                return (
                  <div
                    key={reading.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${colorClass}`} />
                      <div>
                        <p className="font-medium text-card-foreground text-sm">{reading.coastal_sensors?.name}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">{reading.coastal_sensors?.location}</p>
                          <Badge variant="outline" className="text-xs">
                            {typeLabel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${colorClass}`}>
                        {reading.value} {reading.unit}
                      </p>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant={reading.coastal_sensors?.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {reading.coastal_sensors?.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(reading.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

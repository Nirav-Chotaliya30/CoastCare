"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Thermometer, Waves, Wind, Gauge } from "lucide-react"
import { fetchLatestReadings, ingestOpenWeather, ingestMarine } from "@/lib/api/coastal"
import type { SensorReading } from "@/lib/types/coastal"

export function SensorMap() {
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadReadings() {
      try {
        const data = await fetchLatestReadings()
        setReadings(data)
      } catch (error) {
        console.error("Failed to load sensor readings:", error)
      } finally {
        setLoading(false)
      }
    }

    // Trigger server-side OpenWeather ingest, then load readings
    ;(async () => {
      await ingestOpenWeather()
      await ingestMarine()
      await loadReadings()
    })()
    const interval = setInterval(async () => {
      await ingestOpenWeather()
      await ingestMarine()
      await loadReadings()
    }, 60000) // Refresh every 60 seconds

    return () => clearInterval(interval)
  }, [])

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "wind_speed":
        return Wind
      case "temperature":
        return Thermometer
      default:
        return MapPin
    }
  }

  const getSensorColor = (type: string, value: number) => {
    switch (type) {
      case "wind_speed":
        return value > 20 ? "text-destructive" : value > 15 ? "text-secondary" : "text-chart-2"
      case "temperature":
        return value > 35 ? "text-destructive" : value > 25 ? "text-secondary" : value < 10 ? "text-chart-1" : "text-chart-3"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Sensor Network Status
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
            {readings.map((reading) => {
              const Icon = getSensorIcon(reading.coastal_sensors?.sensor_type || "")
              const colorClass = getSensorColor(reading.coastal_sensors?.sensor_type || "", reading.value)

              return (
                <div
                  key={reading.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${colorClass}`} />
                    <div>
                      <p className="font-medium text-card-foreground text-sm">{reading.coastal_sensors?.name}</p>
                      <p className="text-xs text-muted-foreground">{reading.coastal_sensors?.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${colorClass}`}>
                      {reading.value} {reading.unit}
                    </p>
                    <Badge
                      variant={reading.coastal_sensors?.status === "active" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {reading.coastal_sensors?.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

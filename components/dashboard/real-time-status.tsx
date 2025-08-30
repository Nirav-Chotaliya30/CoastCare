"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  Thermometer, 
  Wind, 
  Waves, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react"
import { realtimeDataService, type RealtimeData } from "@/lib/websocket/client"
import type { SensorReading } from "@/lib/types/coastal"

interface SensorTypeStatus {
  type: string
  count: number
  active: number
  critical: number
  lastUpdate: string
  avgValue: number
  unit: string
}

export function RealTimeStatus() {
  const [sensorStatuses, setSensorStatuses] = useState<SensorTypeStatus[]>([])
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = realtimeDataService.subscribe((data: RealtimeData) => {
      const statuses = calculateSensorStatuses(data.readings)
      setSensorStatuses(statuses)
      setLastUpdate(data.timestamp)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const calculateSensorStatuses = (readings: SensorReading[]): SensorTypeStatus[] => {
    const sensorTypes = ['wind_speed', 'temperature', 'wave_height']
    
    return sensorTypes.map(type => {
      const typeReadings = readings.filter(r => r.coastal_sensors?.sensor_type === type)
      const active = typeReadings.filter(r => r.coastal_sensors?.status === 'active').length
      const values = typeReadings.map(r => r.value)
      const avgValue = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
      
      let critical = 0
      if (type === 'wind_speed') {
        critical = values.filter(v => v > 20).length
      } else if (type === 'temperature') {
        critical = values.filter(v => v > 35).length
      } else if (type === 'wave_height') {
        critical = values.filter(v => v > 4).length
      }

      const lastUpdate = typeReadings.length > 0 
        ? typeReadings[0].timestamp 
        : new Date().toISOString()

      return {
        type,
        count: typeReadings.length,
        active,
        critical,
        lastUpdate,
        avgValue: Number(avgValue.toFixed(1)),
        unit: getSensorUnit(type)
      }
    })
  }

  const getSensorIcon = (type: string) => {
    switch (type) {
      case "wind_speed":
        return Wind
      case "temperature":
        return Thermometer
      case "wave_height":
        return Waves
      default:
        return Activity
    }
  }

  const getSensorUnit = (type: string) => {
    switch (type) {
      case "wind_speed":
        return "mph"
      case "temperature":
        return "°C"
      case "wave_height":
        return "m"
      default:
        return ""
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

  const getStatusColor = (status: SensorTypeStatus) => {
    if (status.critical > 0) return "text-destructive"
    if (status.active === status.count && status.count > 0) return "text-green-500"
    return "text-orange-500"
  }

  const getStatusIcon = (status: SensorTypeStatus) => {
    if (status.critical > 0) return XCircle
    if (status.active === status.count && status.count > 0) return CheckCircle
    return AlertCircle
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg animate-pulse">
                <div className="h-4 bg-muted-foreground/20 rounded w-1/3"></div>
                <div className="h-4 bg-muted-foreground/20 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Status
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
        <div className="space-y-3">
          {sensorStatuses.map((status) => {
            const Icon = getSensorIcon(status.type)
            const StatusIcon = getStatusIcon(status)
            const colorClass = getStatusColor(status)
            const typeLabel = getSensorTypeLabel(status.type)

            return (
              <div
                key={status.type}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{typeLabel}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {status.active}/{status.count} active
                      </Badge>
                      {status.critical > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {status.critical} critical
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${colorClass}`} />
                    <div>
                      <p className="font-bold text-sm">
                        {status.avgValue} {status.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(status.lastUpdate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-500">
                {sensorStatuses.reduce((sum, s) => sum + s.active, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Active Sensors</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-500">
                {sensorStatuses.reduce((sum, s) => sum + (s.count - s.active), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">
                {sensorStatuses.reduce((sum, s) => sum + s.critical, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

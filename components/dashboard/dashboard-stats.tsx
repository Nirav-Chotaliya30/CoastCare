"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Activity, 
  AlertTriangle, 
  Thermometer, 
  Wind, 
  Waves, 
  Clock,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { realtimeDataService, type RealtimeData } from "@/lib/websocket/client"
import type { SensorReading } from "@/lib/types/coastal"

interface SensorStats {
  wind_speed: {
    count: number
    avg: number
    max: number
    min: number
    critical: number
  }
  temperature: {
    count: number
    avg: number
    max: number
    min: number
    critical: number
  }
  wave_height: {
    count: number
    avg: number
    max: number
    min: number
    critical: number
  }
}

export function DashboardStats() {
  const [stats, setStats] = useState<SensorStats>({
    wind_speed: { count: 0, avg: 0, max: 0, min: 0, critical: 0 },
    temperature: { count: 0, avg: 0, max: 0, min: 0, critical: 0 },
    wave_height: { count: 0, avg: 0, max: 0, min: 0, critical: 0 }
  })
  const [totalAlerts, setTotalAlerts] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = realtimeDataService.subscribe((data: RealtimeData) => {
      const newStats = calculateStats(data.readings)
      setStats(newStats)
      setTotalAlerts(data.alerts.length)
      setLastUpdate(data.timestamp)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const calculateStats = (readings: SensorReading[]): SensorStats => {
    const stats: SensorStats = {
      wind_speed: { count: 0, avg: 0, max: 0, min: 0, critical: 0 },
      temperature: { count: 0, avg: 0, max: 0, min: 0, critical: 0 },
      wave_height: { count: 0, avg: 0, max: 0, min: 0, critical: 0 }
    }

    const groupedReadings = {
      wind_speed: readings.filter(r => r.coastal_sensors?.sensor_type === 'wind_speed'),
      temperature: readings.filter(r => r.coastal_sensors?.sensor_type === 'temperature'),
      wave_height: readings.filter(r => r.coastal_sensors?.sensor_type === 'wave_height')
    }

    Object.entries(groupedReadings).forEach(([type, typeReadings]) => {
      if (typeReadings.length === 0) return

      const values = typeReadings.map(r => r.value)
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length
      const max = Math.max(...values)
      const min = Math.min(...values)
      
      let critical = 0
      if (type === 'wind_speed') {
        critical = values.filter(v => v > 20).length
      } else if (type === 'temperature') {
        critical = values.filter(v => v > 35).length
      } else if (type === 'wave_height') {
        critical = values.filter(v => v > 4).length
      }

      stats[type as keyof SensorStats] = {
        count: typeReadings.length,
        avg: Number(avg.toFixed(1)),
        max: Number(max.toFixed(1)),
        min: Number(min.toFixed(1)),
        critical
      }
    })

    return stats
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

  const getCriticalColor = (critical: number, total: number) => {
    const percentage = total > 0 ? (critical / total) * 100 : 0
    if (percentage > 30) return "text-destructive"
    if (percentage > 10) return "text-orange-500"
    return "text-green-500"
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
              <div className="h-4 w-4 bg-muted-foreground/20 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted-foreground/20 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted-foreground/20 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Last Update Indicator */}
      {lastUpdate && (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Last updated: {formatTimestamp(lastUpdate)}</span>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {totalAlerts > 0 ? "Requires attention" : "All systems normal"}
            </p>
          </CardContent>
        </Card>

        {/* Wind Speed Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wind Speed</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wind_speed.avg} {getSensorUnit('wind_speed')}</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Max: {stats.wind_speed.max}</span>
              <span className={getCriticalColor(stats.wind_speed.critical, stats.wind_speed.count)}>
                {stats.wind_speed.critical} critical
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Temperature Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.temperature.avg} {getSensorUnit('temperature')}</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Max: {stats.temperature.max}</span>
              <span className={getCriticalColor(stats.temperature.critical, stats.temperature.count)}>
                {stats.temperature.critical} critical
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Wave Height Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wave Height</CardTitle>
            <Waves className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.wave_height.avg} {getSensorUnit('wave_height')}</div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Max: {stats.wave_height.max}</span>
              <span className={getCriticalColor(stats.wave_height.critical, stats.wave_height.count)}>
                {stats.wave_height.critical} critical
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(stats).map(([type, typeStats]) => {
          const Icon = getSensorIcon(type)
          const unit = getSensorUnit(type)
          const typeLabel = type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())
          
          return (
            <Card key={type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {typeLabel}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {typeStats.count} sensors
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Avg:</span>
                    <span className="ml-1 font-medium">{typeStats.avg} {unit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max:</span>
                    <span className="ml-1 font-medium">{typeStats.max} {unit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Min:</span>
                    <span className="ml-1 font-medium">{typeStats.min} {unit}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Critical:</span>
                    <span className={`ml-1 font-medium ${getCriticalColor(typeStats.critical, typeStats.count)}`}>
                      {typeStats.critical}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

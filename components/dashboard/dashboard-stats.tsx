"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, Gauge, Waves } from "lucide-react"
import { fetchDashboardStats } from "@/lib/api/coastal"
import type { CoastalDashboardStats } from "@/lib/types/coastal"

export function DashboardStats() {
  const [stats, setStats] = useState<CoastalDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to load dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
    const interval = setInterval(loadStats, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Sensors",
      value: stats?.totalSensors || 0,
      icon: Gauge,
      description: "Monitoring stations",
    },
    {
      title: "Active Sensors",
      value: stats?.activeSensors || 0,
      icon: Activity,
      description: "Currently operational",
      color: "text-chart-3",
    },
    {
      title: "Active Alerts",
      value: stats?.activeAlerts || 0,
      icon: AlertTriangle,
      description: "Require attention",
      color: stats?.activeAlerts ? "text-secondary" : "text-muted-foreground",
    },
    {
      title: "Critical Alerts",
      value: stats?.criticalAlerts || 0,
      icon: Waves,
      description: "High priority",
      color: stats?.criticalAlerts ? "text-destructive" : "text-muted-foreground",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color || "text-card-foreground"}`}>{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

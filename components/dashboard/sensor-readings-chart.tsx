"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"
import { fetchSensors, fetchSensorReadings } from "@/lib/api/coastal"
import type { CoastalSensor, SensorReading } from "@/lib/types/coastal"

export function SensorReadingsChart() {
  const [sensors, setSensors] = useState<CoastalSensor[]>([])
  const [selectedSensor, setSelectedSensor] = useState<string>("")
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSensors() {
      try {
        const data = await fetchSensors()
        setSensors(data.filter((s) => s.status === "active"))
        if (data.length > 0) {
          setSelectedSensor(data[0].id)
        }
      } catch (error) {
        console.error("Failed to load sensors:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSensors()
  }, [])

  useEffect(() => {
    if (!selectedSensor) return

    async function loadReadings() {
      try {
        const data = await fetchSensorReadings(selectedSensor, { hours: 24, limit: 50 })
        setReadings(data.reverse()) // Reverse to show chronological order
      } catch (error) {
        console.error("Failed to load readings:", error)
      }
    }

    loadReadings()
    const interval = setInterval(loadReadings, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [selectedSensor])

  const chartData = readings.map((reading) => ({
    time: new Date(reading.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: reading.value,
    fullTime: reading.timestamp,
  }))

  const selectedSensorData = sensors.find((s) => s.id === selectedSensor)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sensor Readings (24h)
          </CardTitle>
          <Select value={selectedSensor} onValueChange={setSelectedSensor}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a sensor" />
            </SelectTrigger>
            <SelectContent>
              {sensors.map((sensor) => (
                <SelectItem key={sensor.id} value={sensor.id}>
                  {sensor.name} - {sensor.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80 bg-muted rounded animate-pulse"></div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="time" className="text-muted-foreground" tick={{ fontSize: 12 }} />
                <YAxis
                  className="text-muted-foreground"
                  tick={{ fontSize: 12 }}
                  label={{
                    value: readings[0]?.unit || "",
                    angle: -90,
                    position: "insideLeft",
                    className: "text-muted-foreground",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--card-foreground))",
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return new Date(payload[0].payload.fullTime).toLocaleString()
                    }
                    return label
                  }}
                  formatter={(value: any) => [
                    `${value} ${readings[0]?.unit || ""}`,
                    selectedSensorData?.name || "Value",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--chart-1))", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

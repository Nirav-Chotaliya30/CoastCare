"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SensorReading } from "@/lib/types/coastal"
import { fetchLatestReadings } from "@/lib/api/coastal"

export function SensorCategories({ onToggle }: { onToggle?: (types: string[]) => void }) {
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchLatestReadings()
        setReadings(data)
      } catch (e) {
        console.error("Failed to load readings for categories:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  const grouped = useMemo(() => {
    const groups: Record<string, SensorReading[]> = { wind_speed: [], temperature: [], wave_height: [] }
    for (const r of readings) {
      const t = r.coastal_sensors?.sensor_type
      if (t && groups[t]) groups[t].push(r)
    }
    return groups
  }, [readings])

  const [enabled, setEnabled] = useState<string[]>(["wind_speed", "temperature", "wave_height"])

  useEffect(() => {
    onToggle?.(enabled)
  }, [enabled, onToggle])

  const CategoryList = ({ title, items }: { title: string; items: SensorReading[] }) => (
    <Card className="bg-card border-border min-w-0">
      <CardHeader>
        <CardTitle className="text-card-foreground text-base font-semibold flex items-center justify-between">
          <span>{title}</span>
          <span className="text-xs text-muted-foreground">{items.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-auto p-4">
        {items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No sensors</div>
        ) : (
          <div className="space-y-3">
            {items.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 rounded bg-muted/50 border border-border/50 min-w-0">
                <div className="flex-1 min-w-0 mr-3">
                  <div className="text-sm font-medium text-card-foreground truncate">{r.coastal_sensors?.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.coastal_sensors?.location}</div>
                </div>
                <div className="text-sm font-mono text-right flex-shrink-0 bg-background/50 px-2 py-1 rounded">
                  <div className="text-card-foreground font-semibold">{r.value}</div>
                  <div className="text-xs text-muted-foreground">{r.unit}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-1 lg:col-span-3 flex flex-wrap items-center gap-4 p-3 rounded bg-muted/40 border border-border">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled.includes("wind_speed")} onChange={(e) => {
            setEnabled((prev) => e.target.checked ? Array.from(new Set([...prev, "wind_speed"])) : prev.filter(t => t !== "wind_speed"))
          }} /> Wind Sensors
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled.includes("temperature")} onChange={(e) => {
            setEnabled((prev) => e.target.checked ? Array.from(new Set([...prev, "temperature"])) : prev.filter(t => t !== "temperature"))
          }} /> Temperature Sensors
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled.includes("wave_height")} onChange={(e) => {
            setEnabled((prev) => e.target.checked ? Array.from(new Set([...prev, "wave_height"])) : prev.filter(t => t !== "wave_height"))
          }} /> Wave Sensors
        </label>
        <div className="ml-auto text-xs text-muted-foreground">
          Showing: {enabled.includes("wind_speed") ? "Wind " : ""}
          {enabled.includes("temperature") ? "Temperature " : ""}
          {enabled.includes("wave_height") ? "Waves" : ""}
        </div>
      </div>
      {enabled.includes("wind_speed") && <CategoryList title="Wind Sensors" items={grouped.wind_speed} />}
      {enabled.includes("temperature") && <CategoryList title="Temperature Sensors" items={grouped.temperature} />}
      {enabled.includes("wave_height") && <CategoryList title="Wave Sensors" items={grouped.wave_height} />}
    </div>
  )
}



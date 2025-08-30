"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Thermometer, Waves, Wind, Clock } from "lucide-react"
import type { SensorReading } from "@/lib/types/coastal"
import { realtimeDataService, type RealtimeData } from "@/lib/websocket/client"

export function GeoMap({ enabledTypes = ["wind_speed", "temperature", "wave_height"] as string[] }: { enabledTypes?: string[] }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
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

  useEffect(() => {
    let cleanup = () => {}
    ;(async () => {
      if (!mapContainerRef.current) return
      const L = await import("leaflet")

      // Inject Leaflet CSS (CDN) if not present
      const existing = document.querySelector<HTMLLinkElement>('link[data-href="leaflet-css"]')
      if (!existing) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        link.setAttribute("data-href", "leaflet-css")
        document.head.appendChild(link)
      }

      // Initialize map once
      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current, {
          center: [22.8, 69.0], // Gujarat, India
          zoom: 6,
          scrollWheelZoom: false,
        })
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 18,
        }).addTo(mapRef.current)
      }

      // Clear existing markers layer group
      const group = L.layerGroup().addTo(mapRef.current)

      // Remove any existing sensor legends
      const existingLegends = document.querySelectorAll('[data-sensor-legend="true"]')
      existingLegends.forEach(legend => legend.remove())

      // Enhanced legend control
      const legend = L.control({ position: "bottomright" })
      legend.onAdd = function () {
        const div = L.DomUtil.create("div", "leaflet-control leaflet-bar p-3 text-xs")
        div.setAttribute('data-sensor-legend', 'true')
        div.style.background = "white"
        div.style.borderRadius = "8px"
        div.style.border = "2px solid #ddd"
        div.style.minWidth = "200px"
        div.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"
        div.innerHTML = `
          <div style="margin-bottom:8px;font-weight:600;font-size:14px;border-bottom:1px solid #eee;padding-bottom:4px">Sensor Legend</div>
          <div style="margin-bottom:6px">
            <div style="display:flex;align-items:center;margin-bottom:4px">
              <span style="display:inline-block;width:12px;height:12px;background:#10b981;margin-right:8px;border-radius:50%;border:1px solid #ddd"></span>
              <span style="font-weight:500">Wind Speed</span>
            </div>
            <div style="display:flex;align-items:center;margin-bottom:4px">
              <span style="display:inline-block;width:12px;height:12px;background:#3b82f6;margin-right:8px;border-radius:50%;border:1px solid #ddd"></span>
              <span style="font-weight:500">Temperature</span>
            </div>
            <div style="display:flex;align-items:center;margin-bottom:4px">
              <span style="display:inline-block;width:12px;height:12px;background:#8b5cf6;margin-right:8px;border-radius:50%;border:1px solid #ddd"></span>
              <span style="font-weight:500">Wave Height</span>
            </div>
          </div>
          <div style="margin-top:8px;padding-top:4px;border-top:1px solid #eee">
            <div style="display:flex;align-items:center;margin-bottom:2px">
              <span style="display:inline-block;width:8px;height:8px;background:#10b981;margin-right:6px;border-radius:50%"></span>
              <span style="font-size:11px">Normal</span>
            </div>
            <div style="display:flex;align-items:center;margin-bottom:2px">
              <span style="display:inline-block;width:8px;height:8px;background:#f59e0b;margin-right:6px;border-radius:50%"></span>
              <span style="font-size:11px">Elevated</span>
            </div>
            <div style="display:flex;align-items:center">
              <span style="display:inline-block;width:8px;height:8px;background:#ef4444;margin-right:6px;border-radius:50%"></span>
              <span style="font-size:11px">Critical</span>
            </div>
          </div>
        `
        return div
      }
      legend.addTo(mapRef.current)

      // Filter readings by enabled types and add markers
      readings
        .filter((r) => enabledTypes.includes(r.coastal_sensors?.sensor_type || ""))
        .forEach((r) => {
        const lat = r.coastal_sensors?.latitude
        const lon = r.coastal_sensors?.longitude
        if (typeof lat !== "number" || typeof lon !== "number") return

        const type = r.coastal_sensors?.sensor_type || ""

        // Determine color based on sensor type and value
        let color: string
        let size: number = 8

        if (type === "wind_speed") {
          color = r.value > 20 ? "#ef4444" : r.value > 15 ? "#f59e0b" : "#10b981"
          size = r.value > 20 ? 12 : r.value > 15 ? 10 : 8
        } else if (type === "temperature") {
          color = r.value > 35 ? "#ef4444" : r.value > 25 ? "#f59e0b" : r.value < 10 ? "#3b82f6" : "#10b981"
          size = r.value > 35 ? 12 : r.value > 25 ? 10 : 8
        } else if (type === "wave_height") {
          color = r.value > 4 ? "#ef4444" : r.value > 2.5 ? "#f59e0b" : "#8b5cf6"
          size = r.value > 4 ? 12 : r.value > 2.5 ? 10 : 8
        } else {
          color = "#6b7280"
          size = 8
        }

        // Create custom icon based on sensor type
        const getIconHtml = (sensorType: string) => {
          const iconMap: { [key: string]: string } = {
            wind_speed: "💨",
            temperature: "🌡️",
            wave_height: "🌊"
          }
          return `<div style="
            background: ${color};
            border: 2px solid white;
            border-radius: 50%;
            width: ${size * 2}px;
            height: ${size * 2}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${size}px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">${iconMap[sensorType] || "📍"}</div>`
        }

        const customIcon = L.divIcon({
          html: getIconHtml(type),
          className: "custom-marker",
          iconSize: [size * 2, size * 2],
          iconAnchor: [size, size]
        })

        const marker = L.marker([Number(lat), Number(lon)], { icon: customIcon })

        const name = r.coastal_sensors?.name || "Sensor"
        const location = r.coastal_sensors?.location || "Location"
        const typeLabel = type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())
        const timestamp = new Date(r.timestamp).toLocaleString()
        
        const popup = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 600; color: #1f2937;">${name}</h3>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px;">${location}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin: 8px 0;">
              <span style="font-weight: 500; color: #374151;">${typeLabel}:</span>
              <span style="font-weight: 600; color: ${color}; font-size: 16px;">${r.value} ${r.unit}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
              <span style="font-size: 11px; color: #9ca3af;">Updated: ${timestamp}</span>
            </div>
          </div>
        `
        
        marker.bindPopup(popup)
        marker.addTo(group)
      })

      // Fit bounds if we have points
      const coords = readings
        .map((r) => [r.coastal_sensors?.latitude, r.coastal_sensors?.longitude])
        .filter(([a, b]) => typeof a === "number" && typeof b === "number") as [number, number][]
      if (coords.length > 0) {
        try {
          mapRef.current.fitBounds(coords as any, { padding: [20, 20] })
        } catch {}
      }

      cleanup = () => {
        mapRef.current && group.remove()
      }
    })()

    return () => cleanup()
  }, [readings, enabledTypes])

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
            Real-Time Sensor Map
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
          <div className="h-80 bg-muted rounded-md animate-pulse" />
        ) : (
          <div ref={mapContainerRef} className="h-80 w-full rounded-md border border-border shadow-sm" />
        )}
      </CardContent>
    </Card>
  )
}



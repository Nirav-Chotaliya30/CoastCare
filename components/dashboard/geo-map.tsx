"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SensorReading } from "@/lib/types/coastal"
import { fetchLatestReadings } from "@/lib/api/coastal"

export function GeoMap({ enabledTypes = ["wind_speed", "temperature", "wave_height"] as string[] }: { enabledTypes?: string[] }) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const [readings, setReadings] = useState<SensorReading[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchLatestReadings()
        setReadings(data)
      } catch (e) {
        console.error("Failed to load readings for map:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
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
          center: [22.8, 69.0],
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

      // Legend control
      const legend = L.control({ position: "bottomright" })
      legend.onAdd = function () {
        const div = L.DomUtil.create("div", "leaflet-control leaflet-bar p-2 text-xs")
        div.style.background = "white"
        div.style.borderRadius = "6px"
        div.style.border = "1px solid #ddd"
        div.innerHTML = `
          <div style="margin-bottom:4px;font-weight:600">Legend</div>
          <div><span style="display:inline-block;width:10px;height:10px;background:#10b981;margin-right:6px;border-radius:50%"></span>Normal</div>
          <div><span style="display:inline-block;width:10px;height:10px;background:#f59e0b;margin-right:6px;border-radius:50%"></span>Elevated</div>
          <div><span style="display:inline-block;width:10px;height:10px;background:#ef4444;margin-right:6px;border-radius:50%"></span>Critical</div>
        `
        return div
      }
      legend.addTo(mapRef.current)

      readings
        .filter((r) => enabledTypes.includes(r.coastal_sensors?.sensor_type || ""))
        .forEach((r) => {
        const lat = r.coastal_sensors?.latitude
        const lon = r.coastal_sensors?.longitude
        if (typeof lat !== "number" || typeof lon !== "number") return

        const type = r.coastal_sensors?.sensor_type || ""

        const color =
          type === "wind_speed"
            ? r.value > 20
              ? "#ef4444"
              : r.value > 15
              ? "#f59e0b"
              : "#10b981"
            : type === "temperature"
            ? r.value > 35
              ? "#ef4444"
              : r.value > 25
              ? "#f59e0b"
              : "#10b981"
            : type === "wave_height"
            ? r.value > 4
              ? "#ef4444"
              : r.value > 2.5
              ? "#f59e0b"
              : "#0ea5e9"
            : "#6b7280"

        const circle = L.circleMarker([Number(lat), Number(lon)], {
          radius: 8,
          color,
          fillColor: color,
          fillOpacity: 0.8,
          weight: 1,
        })

        const name = r.coastal_sensors?.name || "Sensor"
        const location = r.coastal_sensors?.location || "Location"
        const popup = `${name}<br/>${location}<br/><strong>${type.replace("_", " ")}</strong>: ${r.value} ${r.unit}`
        circle.bindPopup(popup)
        circle.addTo(group)
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
  }, [readings])

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground text-base font-semibold">Geographical Map</CardTitle>
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



import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { detectAnomalies } from "@/lib/anomaly-detection/detector"

// Open-Meteo Marine API: free, no key required
// Docs: https://open-meteo.com/en/docs/marine-weather-api

export async function POST() {
  try {
    const supabase = await createClient()

    // Get all active wave height sensors
    const { data: sensors, error: sensorsError } = await supabase
      .from("coastal_sensors")
      .select("id,name,location,latitude,longitude,sensor_type,status")
      .eq("status", "active")
      .eq("sensor_type", "wave_height")

    if (sensorsError) {
      console.error("Error fetching sensors:", sensorsError)
      return NextResponse.json({ error: "Failed to fetch sensors" }, { status: 500 })
    }

    if (!sensors || sensors.length === 0) {
      return NextResponse.json({ 
        success: true, 
        inserted: 0, 
        message: "No active wave height sensors found" 
      })
    }

    let inserted = 0
    let alertsGenerated = 0

    for (const sensor of sensors) {
      const lat = Number(sensor.latitude)
      const lon = Number(sensor.longitude)

      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height` 

      let json: any
      try {
        const resp = await fetch(url, { cache: "no-store" })
        if (!resp.ok) {
          console.error("Marine ingest: fetch error", resp.status)
          continue
        }
        json = await resp.json()
      } catch (e) {
        console.error("Marine ingest: exception", e)
        continue
      }

      const times: string[] = json?.hourly?.time || []
      const heights: number[] = json?.hourly?.wave_height || []
      if (!times.length || !heights.length) continue

      // Take the most recent available value
      const lastIdx = times.length - 1
      const valueMeters = Number(heights[lastIdx] ?? 0)
      const timestamp = times[lastIdx]

      // Check for recent duplicate readings (within last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const { data: recentReadings } = await supabase
        .from("sensor_readings")
        .select("id")
        .eq("sensor_id", sensor.id)
        .gte("timestamp", fiveMinutesAgo)
        .limit(1)

      // Skip if we already have a recent reading for this sensor
      if (recentReadings && recentReadings.length > 0) {
        console.log(`Skipping duplicate marine reading for sensor ${sensor.id}`)
        continue
      }

      const { data: reading, error: insertError } = await supabase
        .from("sensor_readings")
        .insert({
          sensor_id: sensor.id,
          value: Number(valueMeters.toFixed(2)),
          unit: "meters",
          timestamp: new Date(timestamp).toISOString(),
          quality_score: 1.0,
        })
        .select()
        .single()

      if (insertError) {
        console.error("Marine ingest: insert error", insertError)
        continue
      }

      inserted++

      try {
        const alerts = await detectAnomalies(sensor as any, reading as any)
        alertsGenerated += alerts.length
      } catch (err) {
        console.error("Marine ingest: anomaly error", err)
      }

      await new Promise((r) => setTimeout(r, 100))
    }

    return NextResponse.json({ success: true, readings_inserted: inserted, alerts_generated: alertsGenerated })
  } catch (error) {
    console.error("Marine ingest error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}



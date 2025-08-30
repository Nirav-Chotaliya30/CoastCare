import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Find allowed sensors (active, Gujarat, supported types)
    const { data: allowedSensors, error: allowedErr } = await supabase
      .from("coastal_sensors")
      .select("id")
      .eq("status", "active")
      .in("sensor_type", ["wind_speed", "temperature", "wave_height"] as any)
      .ilike("location", "%Gujarat%")

    if (allowedErr) {
      console.error("Error fetching allowed sensors:", allowedErr)
      return NextResponse.json({ error: "Failed to fetch latest readings" }, { status: 500 })
    }

    const allowedIds = (allowedSensors || []).map((s: any) => s.id)

    if (allowedIds.length === 0) {
      return NextResponse.json({ readings: [] })
    }

    // Use a more efficient query to get only the latest reading per sensor
    const { data: latestReadings, error } = await supabase
      .from("sensor_readings")
      .select(`
        *,
        coastal_sensors (
          id,
          name,
          location,
          sensor_type,
          status,
          latitude,
          longitude
        )
      `)
      .in("sensor_id", allowedIds)
      .order("timestamp", { ascending: false })

    if (error) {
      console.error("Error fetching latest readings:", error)
      return NextResponse.json({ error: "Failed to fetch latest readings" }, { status: 500 })
    }

    // Properly deduplicate by sensor_id, keeping only the most recent reading
    const sensorMap = new Map()
    for (const reading of latestReadings || []) {
      const sensorId = reading.sensor_id
      const existingReading = sensorMap.get(sensorId)
      
      if (!existingReading || new Date(reading.timestamp) > new Date(existingReading.timestamp)) {
        sensorMap.set(sensorId, reading)
      }
    }

    const readings = Array.from(sensorMap.values())

    return NextResponse.json({ readings })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

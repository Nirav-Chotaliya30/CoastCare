import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sensorTypes = searchParams.get('types')?.split(',') || ['wind_speed', 'temperature', 'wave_height']
    
    const supabase = await createClient()

    // Get latest readings for all requested sensor types
    const { data: sensors, error: sensorsError } = await supabase
      .from("coastal_sensors")
      .select("id, name, location, latitude, longitude, sensor_type, status")
      .eq("status", "active")
      .in("sensor_type", sensorTypes)

    if (sensorsError) {
      return NextResponse.json({ error: "Failed to fetch sensors" }, { status: 500 })
    }

    // Get latest readings for each sensor
    const readings = []
    for (const sensor of sensors || []) {
      const { data: latestReading, error: readingError } = await supabase
        .from("sensor_readings")
        .select("*")
        .eq("sensor_id", sensor.id)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single()

      if (!readingError && latestReading) {
        readings.push({
          ...latestReading,
          coastal_sensors: sensor
        })
      }
    }

    // Get active alerts
    const { data: alerts, error: alertsError } = await supabase
      .from("anomaly_alerts")
      .select(`
        *,
        coastal_sensors (
          id, name, location, sensor_type, latitude, longitude
        )
      `)
      .eq("is_resolved", false)
      .order("created_at", { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      readings,
      alerts: alerts || [],
      sensorCount: sensors?.length || 0
    })
  } catch (error) {
    console.error("WebSocket API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

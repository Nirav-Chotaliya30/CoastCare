import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sensorId = searchParams.get("sensor_id")

    if (!sensorId) {
      return NextResponse.json({ error: "sensor_id parameter required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get real-time updates for the specified sensor
    const { data: readings, error } = await supabase
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
      .eq("sensor_id", sensorId)
      .order("timestamp", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Error fetching real-time readings:", error)
      return NextResponse.json({ error: "Failed to fetch real-time data" }, { status: 500 })
    }

    return NextResponse.json({ readings })
  } catch (error) {
    console.error("WebSocket API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

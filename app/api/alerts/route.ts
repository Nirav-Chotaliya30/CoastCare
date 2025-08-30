import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const resolved = searchParams.get("resolved")
    const severity = searchParams.get("severity")
    const limit = searchParams.get("limit") || "50"

    const supabase = await createClient()

    // Limit alerts to sensors we actually use (wind_speed, temperature)
    const { data: allowedSensors, error: sensorsError } = await supabase
      .from("coastal_sensors")
      .select("id, sensor_type")
      .in("sensor_type", ["wind_speed", "temperature", "wave_height"] as any)
      .eq("status", "active")

    if (sensorsError) {
      console.error("Error fetching sensors for alerts filter:", sensorsError)
      return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
    }

    const sensorIds = (allowedSensors || []).map((s: any) => s.id)

    if (!sensorIds.length) {
      return NextResponse.json({ alerts: [] })
    }

    let query = supabase
      .from("anomaly_alerts")
      .select(`
        *,
        coastal_sensors (
          name,
          location,
          sensor_type,
          latitude,
          longitude
        )
      `)
      .order("created_at", { ascending: false })
      .limit(Number.parseInt(limit))
      .in("sensor_id", sensorIds)

    // Apply filters
    if (resolved !== null) {
      query = query.eq("is_resolved", resolved === "true")
    }

    if (severity) {
      query = query.eq("severity", severity)
    }

    const { data: alerts, error } = await query

    if (error) {
      console.error("Error fetching alerts:", error)
      return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
    }

    return NextResponse.json({ alerts: alerts || [] })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { alertId, is_resolved } = await request.json()

    if (!alertId || typeof is_resolved !== "boolean") {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const supabase = await createClient()

    const updateData: any = { is_resolved }
    if (is_resolved) {
      updateData.resolved_at = new Date().toISOString()
    }

    const { data, error } = await supabase.from("anomaly_alerts").update(updateData).eq("id", alertId).select()

    if (error) {
      console.error("Error updating alert:", error)
      return NextResponse.json({ error: "Failed to update alert" }, { status: 500 })
    }

    return NextResponse.json({ alert: data[0] })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

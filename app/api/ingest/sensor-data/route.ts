import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { detectAnomalies } from "@/lib/anomaly-detection/detector"

interface SensorDataPayload {
  sensor_id: string
  value: number
  unit: string
  timestamp?: string
  quality_score?: number
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sensor_id, value, unit, timestamp, quality_score = 1.0 }: SensorDataPayload = body

    // Validate required fields
    if (!sensor_id || typeof value !== "number" || !unit) {
      return NextResponse.json({ error: "Missing required fields: sensor_id, value, unit" }, { status: 400 })
    }

    // Validate value ranges
    if (value < -1000 || value > 1000) {
      return NextResponse.json({ error: "Value out of acceptable range" }, { status: 400 })
    }

    // Validate quality score
    if (quality_score < 0 || quality_score > 1) {
      return NextResponse.json({ error: "Quality score must be between 0 and 1" }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify sensor exists and is active
    const { data: sensor, error: sensorError } = await supabase
      .from("coastal_sensors")
      .select("*")
      .eq("id", sensor_id)
      .eq("status", "active")
      .single()

    if (sensorError || !sensor) {
      return NextResponse.json({ error: "Sensor not found or inactive" }, { status: 404 })
    }

    // Insert sensor reading
    const { data: reading, error: insertError } = await supabase
      .from("sensor_readings")
      .insert({
        sensor_id,
        value,
        unit,
        timestamp: timestamp || new Date().toISOString(),
        quality_score,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting sensor reading:", insertError)
      return NextResponse.json({ error: "Failed to store sensor reading" }, { status: 500 })
    }

    // Run anomaly detection
    try {
      await detectAnomalies(sensor, reading)
    } catch (anomalyError) {
      console.error("Error in anomaly detection:", anomalyError)
      // Don't fail the request if anomaly detection fails
    }

    return NextResponse.json({
      success: true,
      reading_id: reading.id,
      message: "Sensor data ingested successfully",
    })
  } catch (error) {
    console.error("Data ingestion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

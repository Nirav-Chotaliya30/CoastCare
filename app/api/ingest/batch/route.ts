import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { detectAnomalies } from "@/lib/anomaly-detection/detector"

interface BatchSensorData {
  sensor_id: string
  readings: Array<{
    value: number
    unit: string
    timestamp?: string
    quality_score?: number
  }>
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data }: { data: BatchSensorData[] } = body

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: "Invalid batch data format" }, { status: 400 })
    }

    if (data.length > 1000) {
      return NextResponse.json({ error: "Batch size too large (max 1000 readings)" }, { status: 400 })
    }

    const supabase = await createClient()
    const results = []
    const errors = []

    for (const batch of data) {
      try {
        // Verify sensor exists and is active
        const { data: sensor, error: sensorError } = await supabase
          .from("coastal_sensors")
          .select("*")
          .eq("id", batch.sensor_id)
          .eq("status", "active")
          .single()

        if (sensorError || !sensor) {
          errors.push({ sensor_id: batch.sensor_id, error: "Sensor not found or inactive" })
          continue
        }

        // Prepare readings for batch insert
        const readingsToInsert = batch.readings.map((reading) => ({
          sensor_id: batch.sensor_id,
          value: reading.value,
          unit: reading.unit,
          timestamp: reading.timestamp || new Date().toISOString(),
          quality_score: reading.quality_score || 1.0,
        }))

        // Validate readings
        const invalidReadings = readingsToInsert.filter(
          (r) =>
            typeof r.value !== "number" ||
            r.value < -1000 ||
            r.value > 1000 ||
            r.quality_score < 0 ||
            r.quality_score > 1,
        )

        if (invalidReadings.length > 0) {
          errors.push({ sensor_id: batch.sensor_id, error: "Invalid reading values detected" })
          continue
        }

        // Insert readings
        const { data: insertedReadings, error: insertError } = await supabase
          .from("sensor_readings")
          .insert(readingsToInsert)
          .select()

        if (insertError) {
          console.error("Batch insert error:", insertError)
          errors.push({ sensor_id: batch.sensor_id, error: "Failed to insert readings" })
          continue
        }

        // Run anomaly detection on the latest reading
        if (insertedReadings && insertedReadings.length > 0) {
          const latestReading = insertedReadings[insertedReadings.length - 1]
          try {
            await detectAnomalies(sensor, latestReading)
          } catch (anomalyError) {
            console.error("Anomaly detection error:", anomalyError)
          }
        }

        results.push({
          sensor_id: batch.sensor_id,
          inserted_count: insertedReadings?.length || 0,
          success: true,
        })
      } catch (error) {
        console.error("Batch processing error:", error)
        errors.push({ sensor_id: batch.sensor_id, error: "Processing failed" })
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      errors: errors.length,
      results,
      errors,
    })
  } catch (error) {
    console.error("Batch ingestion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

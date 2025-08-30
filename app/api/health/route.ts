import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Test basic database connectivity
    const { data: sensors, error: sensorsError } = await supabase
      .from("coastal_sensors")
      .select("count", { count: "exact", head: true })

    if (sensorsError) {
      console.error("Database connectivity error:", sensorsError)
      return NextResponse.json({ 
        status: "error", 
        message: "Database connection failed",
        error: sensorsError.message 
      }, { status: 500 })
    }

    // Test alerts table
    const { data: alerts, error: alertsError } = await supabase
      .from("anomaly_alerts")
      .select("count", { count: "exact", head: true })

    if (alertsError) {
      console.error("Alerts table error:", alertsError)
      return NextResponse.json({ 
        status: "error", 
        message: "Alerts table access failed",
        error: alertsError.message 
      }, { status: 500 })
    }

    // Test readings table
    const { data: readings, error: readingsError } = await supabase
      .from("sensor_readings")
      .select("count", { count: "exact", head: true })

    if (readingsError) {
      console.error("Readings table error:", readingsError)
      return NextResponse.json({ 
        status: "error", 
        message: "Readings table access failed",
        error: readingsError.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      status: "healthy",
      message: "All database tables accessible",
      tables: {
        sensors: sensors || 0,
        alerts: alerts || 0,
        readings: readings || 0
      }
    })
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json({ 
      status: "error", 
      message: "Health check failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Determine allowed sensors: active, Gujarat, supported types
    const { data: allowedSensors, error: allowedErr } = await supabase
      .from("coastal_sensors")
      .select("id")
      .eq("status", "active")
      .in("sensor_type", ["wind_speed", "temperature", "wave_height"] as any)
      .ilike("location", "%Gujarat%")

    if (allowedErr) {
      console.error("Error fetching allowed sensors:", allowedErr)
      return NextResponse.json({ error: "Failed to fetch sensor stats" }, { status: 500 })
    }

    const allowedIds = (allowedSensors || []).map((s: any) => s.id)

    // Get total sensors count (restricted to allowed sensors)
    const totalSensors = allowedIds.length

    // Active sensors == allowed sensors
    const activeSensors = totalSensors

    // Get active alerts count - handle case where no sensors exist
    let activeAlerts = 0
    let criticalAlerts = 0

    if (allowedIds.length > 0) {
      const { count: activeAlertsCount, error: activeAlertsError } = await supabase
        .from("anomaly_alerts")
        .select("*", { count: "exact", head: true })
        .eq("is_resolved", false)
        .in("sensor_id", allowedIds)

      if (activeAlertsError) {
        console.error("Error counting active alerts:", activeAlertsError)
        // Don't fail the entire request, just set to 0
        activeAlerts = 0
      } else {
        activeAlerts = activeAlertsCount || 0
      }

      // Get critical alerts count
      const { count: criticalAlertsCount, error: criticalAlertsError } = await supabase
        .from("anomaly_alerts")
        .select("*", { count: "exact", head: true })
        .eq("is_resolved", false)
        .eq("severity", "critical")
        .in("sensor_id", allowedIds)

      if (criticalAlertsError) {
        console.error("Error counting critical alerts:", criticalAlertsError)
        // Don't fail the entire request, just set to 0
        criticalAlerts = 0
      } else {
        criticalAlerts = criticalAlertsCount || 0
      }
    }

    const stats = {
      totalSensors: totalSensors || 0,
      activeSensors: activeSensors || 0,
      activeAlerts: activeAlerts || 0,
      criticalAlerts: criticalAlerts || 0,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

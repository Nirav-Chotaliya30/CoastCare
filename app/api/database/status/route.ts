import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const tables = [
      "coastal_sensors",
      "sensor_readings", 
      "anomaly_alerts",
      "users",
      "user_alert_subscriptions",
      "user_notifications",
      "notification_templates"
    ]
    
    const status: Record<string, { exists: boolean; count?: number; error?: string }> = {}
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true })
        
        if (error) {
          status[table] = { exists: false, error: error.message }
        } else {
          status[table] = { exists: true, count: count || 0 }
        }
      } catch (err) {
        status[table] = { exists: false, error: err instanceof Error ? err.message : "Unknown error" }
      }
    }
    
    const allTablesExist = tables.every(table => status[table].exists)
    
    return NextResponse.json({
      success: true,
      database_status: "connected",
      tables_exist: allTablesExist,
      tables: status,
      recommendations: allTablesExist ? [] : [
        "Run the database setup script: scripts/004_setup_email_subscriptions.sql",
        "Or run the complete setup: scripts/003_create_user_alerts_tables.sql"
      ]
    })
    
  } catch (error) {
    console.error("Database status check error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to check database status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

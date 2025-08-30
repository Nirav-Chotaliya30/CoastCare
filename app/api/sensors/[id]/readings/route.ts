import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "100"
    const hours = searchParams.get("hours") || "24"

    const supabase = await createClient()

    // Calculate timestamp for filtering
    const hoursAgo = new Date()
    hoursAgo.setHours(hoursAgo.getHours() - Number.parseInt(hours))

    const { data: readings, error } = await supabase
      .from("sensor_readings")
      .select(`
        *,
        coastal_sensors (
          name,
          location,
          sensor_type,
          status
        )
      `)
      .eq("sensor_id", id)
      .gte("timestamp", hoursAgo.toISOString())
      .order("timestamp", { ascending: false })
      .limit(Number.parseInt(limit))

    if (error) {
      console.error("Error fetching readings:", error)
      return NextResponse.json({ error: "Failed to fetch readings" }, { status: 500 })
    }

    return NextResponse.json({ readings })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

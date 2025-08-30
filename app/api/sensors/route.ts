import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: sensors, error } = await supabase
      .from("coastal_sensors")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching sensors:", error)
      return NextResponse.json({ error: "Failed to fetch sensors" }, { status: 500 })
    }

    return NextResponse.json({ sensors })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

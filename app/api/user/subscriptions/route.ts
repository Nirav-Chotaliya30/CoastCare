import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { NotificationService } from "@/lib/notifications/service"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's subscriptions
    const { data: subscriptions, error } = await supabase
      .from("user_alert_subscriptions")
      .select(`
        *,
        coastal_sensors (
          name,
          location,
          sensor_type
        )
      `)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching subscriptions:", error)
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
    }

    return NextResponse.json({ subscriptions: subscriptions || [] })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      sensor_id,
      location,
      sensor_type,
      alert_types = [],
      severity_levels = [],
      notification_methods = ["email", "web"]
    } = body

    // Validate required fields
    if (!location && !sensor_id && !sensor_type) {
      return NextResponse.json({ 
        error: "Must specify at least one of: location, sensor_id, or sensor_type" 
      }, { status: 400 })
    }

    // Create subscription
    const { data: subscription, error } = await supabase
      .from("user_alert_subscriptions")
      .insert({
        user_id: user.id,
        sensor_id,
        location,
        sensor_type,
        alert_types,
        severity_levels,
        notification_methods
      })
      .select(`
        *,
        coastal_sensors (
          name,
          location,
          sensor_type
        )
      `)
      .single()

    if (error) {
      console.error("Error creating subscription:", error)
      return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    // Update subscription
    const { data: subscription, error } = await supabase
      .from("user_alert_subscriptions")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user owns the subscription
      .select(`
        *,
        coastal_sensors (
          name,
          location,
          sensor_type
        )
      `)
      .single()

    if (error) {
      console.error("Error updating subscription:", error)
      return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    // Delete subscription
    const { error } = await supabase
      .from("user_alert_subscriptions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user owns the subscription

    if (error) {
      console.error("Error deleting subscription:", error)
      return NextResponse.json({ error: "Failed to delete subscription" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

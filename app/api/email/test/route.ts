import { NextResponse } from "next/server"
import { EmailService } from "@/lib/email/service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, testData } = body

    if (!to) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 })
    }

    console.log("Creating EmailService instance...")
    const emailService = new EmailService()
    console.log("EmailService created, checking status...")
    
    const status = emailService.getStatus()
    console.log("Email service status:", status)
    
    // Test connection first
    console.log("Testing connection...")
    const connectionTest = await emailService.testConnection()
    console.log("Connection test result:", connectionTest)
    
    if (!connectionTest) {
      return NextResponse.json({ 
        error: "Email service connection failed. Check your SMTP configuration.",
        status: status
      }, { status: 500 })
    }

    // Send test email
    const testNotificationData = {
      location: "Test Location, Gujarat",
      sensor_name: "Test_Wind_Sensor_01",
      alert_type: "storm_surge",
      severity: "high",
      message: "This is a test alert notification from CoastCare",
      timestamp: new Date().toLocaleString(),
      threshold_value: 25,
      actual_value: 30,
      unit: "mph"
    }

    console.log("Sending test email...")
    const success = await emailService.sendAlertEmail(to, testNotificationData)
    console.log("Email send result:", success)

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: "Test email sent successfully",
        status: emailService.getStatus()
      })
    } else {
      return NextResponse.json({ 
        error: "Failed to send test email",
        status: emailService.getStatus()
      }, { status: 500 })
    }
  } catch (error) {
    console.error("Email test error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    console.log("GET /api/email/test - Creating EmailService...")
    const emailService = new EmailService()
    console.log("EmailService created, getting status...")
    
    const status = emailService.getStatus()
    console.log("Email service status:", status)
    
    return NextResponse.json({ 
      status,
      configured: status.configured,
      connected: status.connected
    })
  } catch (error) {
    console.error("Email status check error:", error)
    return NextResponse.json({ 
      error: "Failed to check email service status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

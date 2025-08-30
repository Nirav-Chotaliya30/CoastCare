import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Simple email test endpoint")
    
    // Check environment variables
    const envCheck = {
      SMTP_HOST: process.env.SMTP_HOST || 'NOT_SET',
      SMTP_PORT: process.env.SMTP_PORT || 'NOT_SET',
      SMTP_USER: process.env.SMTP_USER ? 'SET' : 'NOT_SET',
      SMTP_PASS: process.env.SMTP_PASS ? 'SET' : 'NOT_SET',
      SMTP_SECURE: process.env.SMTP_SECURE || 'NOT_SET'
    }
    
    console.log("Environment check:", envCheck)
    
    return NextResponse.json({ 
      success: true,
      message: "Simple test endpoint working",
      envCheck: envCheck,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Simple test error:", error)
    return NextResponse.json({ 
      error: "Simple test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}

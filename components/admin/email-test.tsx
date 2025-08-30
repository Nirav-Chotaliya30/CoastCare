"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Mail, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function EmailTest() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{
    configured: boolean
    connected: boolean
  } | null>(null)

  const checkStatus = async () => {
    try {
      console.log("Checking email status...")
      const response = await fetch("/api/email/test")
      console.log("Response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Email status data:", data)
        setStatus(data.status)
      } else {
        const errorData = await response.json()
        console.error("Failed to check email status:", errorData)
        toast({
          title: "Error",
          description: errorData.error || "Failed to check email status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error checking email status:", error)
      toast({
        title: "Error",
        description: "Failed to check email status",
        variant: "destructive"
      })
    }
  }

  const sendTestEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Success",
          description: "Test email sent successfully! Check your inbox."
        })
        setStatus(data.status)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send test email",
          variant: "destructive"
        })
        if (data.status) {
          setStatus(data.status)
        }
      }
    } catch (error) {
      console.error("Error sending test email:", error)
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Service Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="space-y-2">
          <Label>Service Status</Label>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkStatus}
            >
              Check Status
            </Button>
            {status && (
              <div className="flex gap-2">
                <Badge variant={status.configured ? "default" : "destructive"}>
                  {status.configured ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Configured
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Configured
                    </>
                  )}
                </Badge>
                <Badge variant={status.connected ? "default" : "destructive"}>
                  {status.connected ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Connected
                    </>
                  )}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Test Email Form */}
        <div className="space-y-2">
          <Label htmlFor="test-email">Test Email Address</Label>
          <div className="flex gap-2">
            <Input
              id="test-email"
              type="email"
              placeholder="Enter email address to test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button 
              onClick={sendTestEmail} 
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Test
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Configuration Required</h4>
          <p className="text-sm text-muted-foreground mb-2">
            Set these environment variables to enable email notifications:
          </p>
          <div className="space-y-1 text-sm font-mono">
            <div>SMTP_HOST=smtp.gmail.com</div>
            <div>SMTP_PORT=587</div>
            <div>SMTP_SECURE=false</div>
            <div>SMTP_USER=your-email@gmail.com</div>
            <div>SMTP_PASS=your-app-password</div>
          </div>
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Note:</strong> For Gmail, you'll need to use an App Password instead of your regular password. 
                Enable 2-factor authentication and generate an App Password in your Google Account settings.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Bell, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function EmailSubscription() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [sensorType, setSensorType] = useState("")
  const [alertTypes, setAlertTypes] = useState<string[]>([])
  const [severityLevels, setSeverityLevels] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/public/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({
           email,
           name,
           location: location === "all" ? undefined : location || undefined,
           sensor_type: sensorType === "all" ? undefined : sensorType || undefined,
           alert_types: alertTypes,
           severity_levels: severityLevels,
           notification_methods: ["email"]
         })
      })

      if (response.ok) {
        toast({
          title: "Success!",
          description: "You've been subscribed to coastal alerts. Check your email for confirmation."
        })
        setSubscribed(true)
        setEmail("")
        setName("")
        setLocation("")
        setSensorType("")
        setAlertTypes([])
        setSeverityLevels([])
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to subscribe. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Subscription error:", error)
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (subscribed) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-green-800 mb-2">Successfully Subscribed!</h3>
          <p className="text-green-700 mb-4">
            You'll now receive real-time coastal alerts via email.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSubscribed(false)}
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            Subscribe Another Email
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-subscription-form className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Subscribe to Coastal Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {/* Landscape Layout - All elements in horizontal rows */}
          <div className="space-y-4">
            {/* Row 1: Email and Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Row 2: Location and Sensor Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Location (Optional)</Label>
                <Select value={location || undefined} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    <SelectItem value="Okha, Gujarat">Okha, Gujarat</SelectItem>
                    <SelectItem value="Dwarka, Gujarat">Dwarka, Gujarat</SelectItem>
                    <SelectItem value="Porbandar, Gujarat">Porbandar, Gujarat</SelectItem>
                    <SelectItem value="Veraval, Gujarat">Veraval, Gujarat</SelectItem>
                    <SelectItem value="Mundra, Gujarat">Mundra, Gujarat</SelectItem>
                    <SelectItem value="Kandla, Gujarat">Kandla, Gujarat</SelectItem>
                    <SelectItem value="Bhavnagar, Gujarat">Bhavnagar, Gujarat</SelectItem>
                    <SelectItem value="Surat, Gujarat">Surat, Gujarat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sensor Type (Optional)</Label>
                <Select value={sensorType || undefined} onValueChange={setSensorType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sensor type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All sensor types</SelectItem>
                    <SelectItem value="wind_speed">Wind Speed</SelectItem>
                    <SelectItem value="temperature">Temperature</SelectItem>
                    <SelectItem value="wave_height">Wave Height</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Alert Types and Severity Levels in horizontal layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Alert Types</Label>
                <div className="grid grid-cols-2 gap-3">
                  {["storm_surge", "extreme_waves", "high_water", "equipment_failure"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={alertTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setAlertTypes([...alertTypes, type])
                          } else {
                            setAlertTypes(alertTypes.filter(t => t !== type))
                          }
                        }}
                      />
                      <Label htmlFor={type} className="text-sm font-medium cursor-pointer">
                        {type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Severity Levels</Label>
                <div className="grid grid-cols-2 gap-3">
                  {["low", "medium", "high", "critical"].map((severity) => (
                    <div key={severity} className="flex items-center space-x-2">
                      <Checkbox
                        id={severity}
                        checked={severityLevels.includes(severity)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSeverityLevels([...severityLevels, severity])
                          } else {
                            setSeverityLevels(severityLevels.filter(s => s !== severity))
                          }
                        }}
                      />
                      <Label htmlFor={severity} className="text-sm font-medium capitalize cursor-pointer">
                        {severity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 4: Submit Button */}
            <div className="pt-2">
              <Button type="submit" className="w-full md:w-auto px-8" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Subscribe to Alerts
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Information Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <strong>What you'll receive:</strong> Real-time email alerts about coastal conditions, 
              storm surges, extreme waves, and equipment failures in your selected area.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

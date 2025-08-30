"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Bell, Mail, Smartphone, Monitor, Plus, Trash2, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface Subscription {
  id: string
  sensor_id?: string
  location?: string
  sensor_type?: string
  alert_types: string[]
  severity_levels: string[]
  notification_methods: string[]
  coastal_sensors?: {
    name: string
    location: string
    sensor_type: string
  }
}

interface Sensor {
  id: string
  name: string
  location: string
  sensor_type: string
}

export function AlertSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [sensors, setSensors] = useState<Sensor[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    sensor_id: "",
    location: "",
    sensor_type: "",
    alert_types: [] as string[],
    severity_levels: [] as string[],
    notification_methods: ["email", "web"] as string[]
  })

  useEffect(() => {
    loadSubscriptions()
    loadSensors()
  }, [])

  const loadSubscriptions = async () => {
    try {
      const response = await fetch("/api/user/subscriptions")
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions)
      }
    } catch (error) {
      console.error("Failed to load subscriptions:", error)
      toast({
        title: "Error",
        description: "Failed to load your alert subscriptions",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSensors = async () => {
    try {
      const response = await fetch("/api/sensors")
      if (response.ok) {
        const data = await response.json()
        setSensors(data.sensors)
      }
    } catch (error) {
      console.error("Failed to load sensors:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingSubscription 
        ? "/api/user/subscriptions" 
        : "/api/user/subscriptions"
      
      const method = editingSubscription ? "PUT" : "POST"
      const body = editingSubscription 
        ? { id: editingSubscription.id, ...formData }
        : formData

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: editingSubscription 
            ? "Subscription updated successfully" 
            : "Subscription created successfully"
        })
        setIsDialogOpen(false)
        setEditingSubscription(null)
        resetForm()
        loadSubscriptions()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to save subscription",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Failed to save subscription:", error)
      toast({
        title: "Error",
        description: "Failed to save subscription",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subscription?")) return

    try {
      const response = await fetch(`/api/user/subscriptions?id=${id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subscription deleted successfully"
        })
        loadSubscriptions()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete subscription",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Failed to delete subscription:", error)
      toast({
        title: "Error",
        description: "Failed to delete subscription",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setFormData({
      sensor_id: subscription.sensor_id || "",
      location: subscription.location || "",
      sensor_type: subscription.sensor_type || "",
      alert_types: subscription.alert_types,
      severity_levels: subscription.severity_levels,
      notification_methods: subscription.notification_methods
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      sensor_id: "",
      location: "",
      sensor_type: "",
      alert_types: [],
      severity_levels: [],
      notification_methods: ["email", "web"]
    })
  }

  const getNotificationIcon = (method: string) => {
    switch (method) {
      case "email": return Mail
      case "sms": return Smartphone
      case "web": return Monitor
      case "push": return Bell
      default: return Bell
    }
  }

  const getSubscriptionDescription = (subscription: Subscription) => {
    if (subscription.coastal_sensors) {
      return `${subscription.coastal_sensors.name} - ${subscription.coastal_sensors.location}`
    }
    if (subscription.location) {
      return `All sensors in ${subscription.location}`
    }
    if (subscription.sensor_type) {
      return `All ${subscription.sensor_type.replace("_", " ")} sensors`
    }
    return "All sensors"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading subscriptions...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Subscriptions</h2>
          <p className="text-muted-foreground">
            Manage your real-time alert notifications
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSubscription(null)
              resetForm()
            }}>
              <Plus className="h-4 w-4 mr-2" />
              New Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSubscription ? "Edit Subscription" : "New Alert Subscription"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Location</Label>
                <Select 
                  value={formData.location} 
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All locations</SelectItem>
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
                <Label>Sensor Type</Label>
                <Select 
                  value={formData.sensor_type} 
                  onValueChange={(value) => setFormData({ ...formData, sensor_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sensor type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All sensor types</SelectItem>
                    <SelectItem value="wind_speed">Wind Speed</SelectItem>
                    <SelectItem value="temperature">Temperature</SelectItem>
                    <SelectItem value="wave_height">Wave Height</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Alert Types</Label>
                <div className="space-y-2">
                  {["storm_surge", "extreme_waves", "high_water", "equipment_failure"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={formData.alert_types.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              alert_types: [...formData.alert_types, type]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              alert_types: formData.alert_types.filter(t => t !== type)
                            })
                          }
                        }}
                      />
                      <Label htmlFor={type} className="text-sm">
                        {type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Severity Levels</Label>
                <div className="space-y-2">
                  {["low", "medium", "high", "critical"].map((severity) => (
                    <div key={severity} className="flex items-center space-x-2">
                      <Checkbox
                        id={severity}
                        checked={formData.severity_levels.includes(severity)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              severity_levels: [...formData.severity_levels, severity]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              severity_levels: formData.severity_levels.filter(s => s !== severity)
                            })
                          }
                        }}
                      />
                      <Label htmlFor={severity} className="text-sm capitalize">
                        {severity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notification Methods</Label>
                <div className="space-y-2">
                  {["email", "web", "sms", "push"].map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Checkbox
                        id={method}
                        checked={formData.notification_methods.includes(method)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              notification_methods: [...formData.notification_methods, method]
                            })
                          } else {
                            setFormData({
                              ...formData,
                              notification_methods: formData.notification_methods.filter(m => m !== method)
                            })
                          }
                        }}
                      />
                      <Label htmlFor={method} className="text-sm capitalize">
                        {method}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingSubscription ? "Update" : "Create"} Subscription
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subscriptions yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first alert subscription to get notified about coastal conditions
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Subscription
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold">
                      {getSubscriptionDescription(subscription)}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2">
                      {subscription.alert_types.map((type) => (
                        <Badge key={type} variant="secondary">
                          {type.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {subscription.severity_levels.map((severity) => (
                        <Badge key={severity} variant="outline">
                          {severity}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {subscription.notification_methods.map((method) => {
                        const Icon = getNotificationIcon(method)
                        return (
                          <div key={method} className="flex items-center gap-1">
                            <Icon className="h-3 w-3" />
                            <span className="capitalize">{method}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(subscription)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(subscription.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

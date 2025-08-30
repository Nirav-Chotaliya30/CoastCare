"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Bell, Check, Settings, Trash2, Volume2, VolumeX } from "lucide-react"
import { useNotifications } from "./notification-provider"

export function NotificationCenter() {
  const { alerts, settings, updateSettings, acknowledgeAlert, clearAllAlerts } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const unacknowledgedCount = alerts.filter((alert) => !alert.acknowledged).length
  const criticalCount = alerts.filter((alert) => !alert.acknowledged && alert.alert?.severity === "critical").length

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "secondary"
      case "medium":
        return "default"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative bg-transparent">
          <Bell className="h-4 w-4" />
          {unacknowledgedCount > 0 && (
            <Badge
              variant={criticalCount > 0 ? "destructive" : "secondary"}
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
            >
              {unacknowledgedCount > 99 ? "99+" : unacknowledgedCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-96 sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateSettings({ soundAlerts: !settings.soundAlerts })}
                title={settings.soundAlerts ? "Disable sound alerts" : "Enable sound alerts"}
              >
                {settings.soundAlerts ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              {alerts.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllAlerts} title="Clear all notifications">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Notification Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Browser Notifications</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (Notification.permission === "granted") {
                      updateSettings({ browserNotifications: !settings.browserNotifications })
                    } else {
                      Notification.requestPermission().then((permission) => {
                        if (permission === "granted") {
                          updateSettings({ browserNotifications: true })
                        }
                      })
                    }
                  }}
                >
                  {settings.browserNotifications ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Critical Alerts Only</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSettings({ criticalOnly: !settings.criticalOnly })}
                >
                  {settings.criticalOnly ? "Yes" : "No"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alert List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`${alert.acknowledged ? "opacity-60" : ""} ${
                    alert.alert?.severity === "critical" ? "border-destructive" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={getSeverityColor(alert.alert?.severity || "medium") as any}
                            className="text-xs"
                          >
                            {alert.alert?.severity?.toUpperCase() || "ALERT"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{alert.alert?.message || "System alert"}</p>
                        {alert.alert?.coastal_sensors && (
                          <p className="text-xs text-muted-foreground">
                            {alert.alert.coastal_sensors.name} - {alert.alert.coastal_sensors.location}
                          </p>
                        )}
                        {alert.alert?.threshold_value && alert.alert?.actual_value && (
                          <p className="text-xs text-muted-foreground">
                            Threshold: {alert.alert.threshold_value} | Actual: {alert.alert.actual_value}
                          </p>
                        )}
                      </div>
                      {!alert.acknowledged && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                          title="Acknowledge alert"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

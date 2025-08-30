"use client"

import { Settings, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationCenter } from "@/components/notifications/notification-center"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-card-foreground">CoastCare</h1>
            <p className="text-sm text-muted-foreground">Real-time Monitoring Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationCenter />
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

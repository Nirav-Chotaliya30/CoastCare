"use client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { AlertsPanel } from "@/components/dashboard/alerts-panel"
import { RecentAlerts } from "@/components/dashboard/recent-alerts"
import { GeoMap } from "@/components/dashboard/geo-map"
import { SensorCategories } from "@/components/dashboard/sensor-categories"
import { RealTimeStatus } from "@/components/dashboard/real-time-status"
import { AlertBanner } from "@/components/notifications/alert-banner"
import { EmailSubscription } from "@/components/home/email-subscription"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { Footer } from "@/components/home/footer"

import { useState } from "react"

export default function CoastalDashboard() {
  const [enabledTypes, setEnabledTypes] = useState<string[]>(["wind_speed", "temperature", "wave_height"])
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <AlertBanner />

      <main className="container mx-auto px-6 py-6 space-y-6">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Dashboard Statistics */}
        <DashboardStats />

        {/* Features Section */}
        <FeaturesSection />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts, Map, and Email Subscription */}
          <div className="lg:col-span-2 space-y-6">
            <GeoMap enabledTypes={enabledTypes} />
            <SensorCategories onToggle={setEnabledTypes} />
            <EmailSubscription />
          </div>

          {/* Right Column - Alerts and Status */}
          <div className="space-y-6">
            <RealTimeStatus />
            <AlertsPanel />
            <RecentAlerts />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

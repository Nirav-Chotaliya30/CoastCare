"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Waves, Shield, Bell, MapPin } from "lucide-react"

export function HeroSection() {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Waves className="h-12 w-12 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900">
            CoastCare Monitoring System
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real-time coastal monitoring and alert system for Gujarat's coastline. 
            Stay informed about weather conditions, wave heights, and potential hazards.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
              <MapPin className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">8 Locations</h3>
                <p className="text-sm text-gray-600">Monitored across Gujarat</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
              <Shield className="h-6 w-6 text-green-600" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">24/7 Monitoring</h3>
                <p className="text-sm text-gray-600">Continuous surveillance</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
              <Bell className="h-6 w-6 text-orange-600" />
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">Instant Alerts</h3>
                <p className="text-sm text-gray-600">Real-time notifications</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // Scroll to subscription form
                const subscriptionElement = document.querySelector('[data-subscription-form]')
                if (subscriptionElement) {
                  subscriptionElement.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              <Bell className="h-4 w-4 mr-2" />
              Subscribe to Alerts
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

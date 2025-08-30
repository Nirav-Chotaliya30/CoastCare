"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Waves, Shield, Bell, MapPin, Activity, AlertTriangle, Clock, Globe } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <Waves className="h-8 w-8 text-blue-600" />,
      title: "Real-time Monitoring",
      description: "Continuous monitoring of wind speed, temperature, and wave height across 8 strategic locations in Gujarat."
    },
    {
      icon: <Bell className="h-8 w-8 text-orange-600" />,
      title: "Instant Alerts",
      description: "Get immediate notifications about storm surges, extreme waves, and equipment failures via email."
    },
    {
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      title: "Location-based",
      description: "Receive alerts specific to your area of interest along Gujarat's 1,600 km coastline."
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Safety First",
      description: "Early warning system designed to protect coastal communities and maritime activities."
    },
    {
      icon: <Activity className="h-8 w-8 text-red-600" />,
      title: "Anomaly Detection",
      description: "Advanced algorithms detect unusual patterns and potential hazards automatically."
    },
    {
      icon: <Clock className="h-8 w-8 text-indigo-600" />,
      title: "24/7 Coverage",
      description: "Round-the-clock monitoring ensures you never miss critical coastal conditions."
    }
  ]

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Why Choose CoastCare?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our comprehensive coastal monitoring system provides real-time data and alerts 
          to keep you informed and safe along Gujarat's coastline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                {feature.icon}
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Protecting Gujarat's Coastline
          </h3>
          <p className="text-gray-600 mb-4">
            From Okha to Surat, our network of sensors monitors the entire Gujarat coastline, 
            providing critical data for maritime safety and coastal protection.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Okha, Dwarka, Porbandar
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Veraval, Mundra, Kandla
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Bhavnagar, Surat
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

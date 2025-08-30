"use client"

import { Waves, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Waves className="h-8 w-8 text-blue-400" />
              <h3 className="text-xl font-bold">CoastCare</h3>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Real-time coastal monitoring and alert system for Gujarat's coastline. 
              Protecting communities through advanced sensor technology and instant notifications.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center gap-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="text-sm">support@coastcare.in</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Alerts</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Sensors</a></li>
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Gujarat, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+91 1800-COAST</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">info@coastcare.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 CoastCare. All rights reserved. | Protecting Gujarat's Coastline</p>
        </div>
      </div>
    </footer>
  )
}

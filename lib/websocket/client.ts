"use client"

import type { SensorReading, AnomalyAlert } from "@/lib/types/coastal"

export interface RealtimeData {
  timestamp: string
  readings: SensorReading[]
  alerts: AnomalyAlert[]
  sensorCount: number
}

export interface RealtimeDataCallback {
  (data: RealtimeData): void
}

class RealtimeDataService {
  private intervalId: NodeJS.Timeout | null = null
  private callbacks: RealtimeDataCallback[] = []
  private isRunning = false
  private lastData: RealtimeData | null = null

  constructor(private updateInterval: number = 15000) {} // 15 seconds for more frequent updates

  subscribe(callback: RealtimeDataCallback): () => void {
    this.callbacks.push(callback)
    
    // If this is the first subscriber, start the service
    if (!this.isRunning) {
      this.start()
    }

    // Return unsubscribe function
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback)
      if (this.callbacks.length === 0) {
        this.stop()
      }
    }
  }

  private async triggerDataIngestion(): Promise<void> {
    try {
      // Trigger batch ingestion to get fresh data from all APIs
      await fetch('/api/ingest/batch', { 
        method: 'POST',
        cache: 'no-store'
      })
    } catch (error) {
      console.error('Failed to trigger data ingestion:', error)
    }
  }

  private async fetchData(): Promise<RealtimeData | null> {
    try {
      const response = await fetch('/api/websocket?types=wind_speed,temperature,wave_height', {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Failed to fetch real-time data:', error)
      return null
    }
  }

  private async updateData() {
    // First trigger data ingestion to get fresh data
    await this.triggerDataIngestion()
    
    // Then fetch the updated data
    const data = await this.fetchData()
    if (data) {
      this.lastData = data
      this.callbacks.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in real-time data callback:', error)
        }
      })
    }
  }

  private start() {
    if (this.isRunning) return
    
    this.isRunning = true
    
    // Initial fetch
    this.updateData()
    
    // Set up interval for regular updates
    this.intervalId = setInterval(() => {
      this.updateData()
    }, this.updateInterval)
  }

  private stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
  }

  getLastData(): RealtimeData | null {
    return this.lastData
  }

  // Manual trigger for immediate update
  async refresh() {
    await this.updateData()
  }
}

// Create singleton instance
export const realtimeDataService = new RealtimeDataService()

// Export hook for React components
export function useRealtimeData(callback: RealtimeDataCallback, deps: any[] = []) {
  const { useEffect } = require('react')
  
  useEffect(() => {
    const unsubscribe = realtimeDataService.subscribe(callback)
    return unsubscribe
  }, deps)
}

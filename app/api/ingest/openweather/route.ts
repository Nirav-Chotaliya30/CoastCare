import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { detectAnomalies } from "@/lib/anomaly-detection/detector"

interface CoordinateKey {
  latitude: number
  longitude: number
}

interface WeatherData {
  wind_speed: number
  temperature: number
  humidity: number
  pressure: number
  visibility: number
  description: string
}

function toCoordKey(lat: number, lon: number): string {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`
}

async function fetchWeatherData(lat: number, lon: number, apiKey: string): Promise<WeatherData | null> {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    
    const response = await fetch(url, { 
      cache: "no-store",
      headers: {
        'User-Agent': 'CoastCare/1.0'
      }
    })
    
    if (!response.ok) {
      console.error(`OpenWeather API error: ${response.status} ${response.statusText}`)
      return null
    }
    
    const data = await response.json()
    
    return {
      wind_speed: Number(data?.wind?.speed ?? 0),
      temperature: Number(data?.main?.temp ?? 0),
      humidity: Number(data?.main?.humidity ?? 0),
      pressure: Number(data?.main?.pressure ?? 0),
      visibility: Number(data?.visibility ?? 0),
      description: data?.weather?.[0]?.description ?? "Unknown"
    }
  } catch (error) {
    console.error(`Error fetching weather data for ${lat},${lon}:`, error)
    return null
  }
}

export async function POST() {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: "OPENWEATHER_API_KEY not configured",
        message: "Please set OPENWEATHER_API_KEY environment variable"
      }, { status: 500 })
    }

    const supabase = await createClient()

    // Get all active sensors that support OpenWeather data
    const { data: sensors, error: sensorsError } = await supabase
      .from("coastal_sensors")
      .select("id,name,location,latitude,longitude,sensor_type,status")
      .eq("status", "active")
      .in("sensor_type", ["wind_speed", "temperature"] as any)

    if (sensorsError) {
      console.error("Error fetching sensors:", sensorsError)
      return NextResponse.json({ error: "Failed to fetch sensors" }, { status: 500 })
    }

    if (!sensors || sensors.length === 0) {
      return NextResponse.json({ 
        success: true, 
        inserted: 0, 
        message: "No active sensors found for weather data" 
      })
    }

    // Group sensors by coordinates to minimize API calls
    const coordToSensors = new Map<string, any[]>()
    for (const sensor of sensors) {
      const key = toCoordKey(Number(sensor.latitude), Number(sensor.longitude))
      const arr = coordToSensors.get(key) || []
      arr.push(sensor)
      coordToSensors.set(key, arr)
    }

    const results: { 
      coordinate: string
      success: boolean
      readings_inserted: number
      alerts_generated: number
      error?: string
    }[] = []

    // Process each unique coordinate
    for (const [coordKey, sensorGroup] of coordToSensors.entries()) {
      const [latStr, lonStr] = coordKey.split(",")
      const lat = Number(latStr)
      const lon = Number(lonStr)

      // Fetch weather data for this coordinate
      const weatherData = await fetchWeatherData(lat, lon, apiKey)
      
      if (!weatherData) {
        results.push({
          coordinate: coordKey,
          success: false,
          readings_inserted: 0,
          alerts_generated: 0,
          error: "Failed to fetch weather data"
        })
        continue
      }

      let readingsInserted = 0
      let alertsGenerated = 0

      // Insert readings for each sensor at this coordinate
      for (const sensor of sensorGroup) {
        let value: number
        let unit: string

        if (sensor.sensor_type === "wind_speed") {
          // Convert m/s to mph for consistency with UI thresholds
          value = Number((weatherData.wind_speed * 2.2369362921).toFixed(2))
          unit = "mph"
        } else if (sensor.sensor_type === "temperature") {
          value = Number(weatherData.temperature.toFixed(2))
          unit = "celsius"
        } else {
          continue // Skip unsupported sensor types
        }

        // Check for recent duplicate readings (within last 5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
        const { data: recentReadings } = await supabase
          .from("sensor_readings")
          .select("id")
          .eq("sensor_id", sensor.id)
          .gte("timestamp", fiveMinutesAgo)
          .limit(1)

        // Skip if we already have a recent reading for this sensor
        if (recentReadings && recentReadings.length > 0) {
          console.log(`Skipping duplicate reading for sensor ${sensor.id}`)
          continue
        }

        // Insert the reading
        const { data: reading, error: insertError } = await supabase
          .from("sensor_readings")
          .insert({
            sensor_id: sensor.id,
            value,
            unit,
            timestamp: new Date().toISOString(),
            quality_score: 1.0,
          })
          .select()
          .single()

        if (insertError) {
          console.error(`Error inserting reading for sensor ${sensor.id}:`, insertError)
          continue
        }

        readingsInserted++

        // Run anomaly detection on the new reading
        try {
          const alerts = await detectAnomalies(sensor, reading)
          alertsGenerated += alerts.length
        } catch (anomalyError) {
          console.error(`Error in anomaly detection for sensor ${sensor.id}:`, anomalyError)
        }
      }

      results.push({
        coordinate: coordKey,
        success: true,
        readings_inserted: readingsInserted,
        alerts_generated: alertsGenerated
      })

      // Add small delay between coordinate groups to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const totalInserted = results.reduce((sum, r) => sum + r.readings_inserted, 0)
    const totalAlerts = results.reduce((sum, r) => sum + r.alerts_generated, 0)

    return NextResponse.json({
      success: true,
      results,
      total_readings_inserted: totalInserted,
      total_alerts_generated: totalAlerts
    })
  } catch (error) {
    console.error("OpenWeather ingest error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}



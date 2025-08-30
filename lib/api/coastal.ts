import type { CoastalSensor, SensorReading, AnomalyAlert, DashboardStats } from "@/lib/types/coastal"

const API_BASE = "/api"

export async function fetchSensors(): Promise<CoastalSensor[]> {
  const response = await fetch(`${API_BASE}/sensors`)
  if (!response.ok) {
    throw new Error("Failed to fetch sensors")
  }
  const data = await response.json()
  return data.sensors
}

export async function fetchSensorReadings(
  sensorId: string,
  options: { limit?: number; hours?: number } = {},
): Promise<SensorReading[]> {
  const params = new URLSearchParams()
  if (options.limit) params.append("limit", options.limit.toString())
  if (options.hours) params.append("hours", options.hours.toString())

  const response = await fetch(`${API_BASE}/sensors/${sensorId}/readings?${params}`)
  if (!response.ok) {
    throw new Error("Failed to fetch sensor readings")
  }
  const data = await response.json()
  return data.readings
}

export async function fetchAlerts(
  options: {
    resolved?: boolean
    severity?: string
    limit?: number
  } = {},
): Promise<AnomalyAlert[]> {
  const params = new URLSearchParams()
  if (options.resolved !== undefined) params.append("resolved", options.resolved.toString())
  if (options.severity) params.append("severity", options.severity)
  if (options.limit) params.append("limit", options.limit.toString())

  const response = await fetch(`${API_BASE}/alerts?${params}`)
  if (!response.ok) {
    throw new Error("Failed to fetch alerts")
  }
  const data = await response.json()
  return data.alerts
}

export async function updateAlert(alertId: string, isResolved: boolean): Promise<AnomalyAlert> {
  const response = await fetch(`${API_BASE}/alerts`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      alertId,
      is_resolved: isResolved,
    }),
  })

  if (!response.ok) {
    throw new Error("Failed to update alert")
  }
  const data = await response.json()
  return data.alert
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE}/dashboard/stats`)
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard stats")
  }
  const data = await response.json()
  return data.stats
}

export async function fetchLatestReadings(): Promise<SensorReading[]> {
  const response = await fetch(`${API_BASE}/readings/latest`)
  if (!response.ok) {
    throw new Error("Failed to fetch latest readings")
  }
  const data = await response.json()
  return data.readings
}

export async function ingestOpenWeather(): Promise<void> {
  try {
    await fetch(`${API_BASE}/ingest/openweather`, { method: "POST" })
  } catch {
    // Best-effort trigger; ignore errors on client
  }
}

export async function ingestMarine(): Promise<void> {
  try {
    await fetch(`${API_BASE}/ingest/marine`, { method: "POST" })
  } catch {}
}

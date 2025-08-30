export interface CoastalSensor {
  id: string
  name: string
  location: string
  latitude: number
  longitude: number
  sensor_type: "wind_speed" | "temperature" | "wave_height"
  status: "active" | "inactive" | "maintenance"
  created_at: string
  updated_at: string
}

export interface SensorReading {
  id: string
  sensor_id: string
  value: number
  unit: string
  timestamp: string
  quality_score: number
  created_at: string
  coastal_sensors?: CoastalSensor
}

export interface AnomalyAlert {
  id: string
  sensor_id: string
  alert_type: "high_water" | "extreme_waves" | "storm_surge" | "equipment_failure"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  threshold_value?: number
  actual_value?: number
  is_resolved: boolean
  created_at: string
  resolved_at?: string
  coastal_sensors?: CoastalSensor
}

export interface DashboardStats {
  totalSensors: number
  activeSensors: number
  activeAlerts: number
  criticalAlerts: number
}

export interface NotificationSettings {
  browserNotifications: boolean
  soundAlerts: boolean
  criticalOnly: boolean
}

export interface RealtimeAlert {
  id: string
  type: "new_alert" | "alert_resolved" | "sensor_offline" | "critical_threshold"
  alert?: AnomalyAlert
  sensor?: CoastalSensor
  timestamp: string
  acknowledged: boolean
}

export interface WebSocketMessage {
  type: "alert" | "sensor_update" | "system_status"
  data: any
  timestamp: string
}

export interface CoastalDashboardStats extends DashboardStats {}

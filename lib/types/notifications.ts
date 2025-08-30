export interface NotificationData {
  location: string
  sensor_name: string
  alert_type: string
  severity: string
  message: string
  timestamp: string
  threshold_value?: number
  actual_value?: number
  unit?: string
}

export interface UserSubscription {
  id: string
  user_id: string
  sensor_id?: string
  location?: string
  sensor_type?: string
  alert_types: string[]
  severity_levels: string[]
  notification_methods: string[]
}

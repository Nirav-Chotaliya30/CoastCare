import { createClient } from "@/lib/supabase/server"
import type { CoastalSensor, SensorReading, AnomalyAlert } from "@/lib/types/coastal"
import { NotificationService } from "@/lib/notifications/service"

// Thresholds for different sensor types
const THRESHOLDS = {
  wind_speed: {
    low: 15, // mph
    high: 25, // mph
    critical: 35, // mph
    extreme: 50, // mph
  },
  temperature: {
    low: 10, // celsius
    high: 35, // celsius
    critical: 40, // celsius
    extreme: 45, // celsius
  },
  wave_height: {
    low: 2, // meters
    high: 4, // meters
    critical: 6, // meters
    extreme: 8, // meters
  },
  water_level: {
    low: 1, // meters
    high: 2, // meters
    critical: 3, // meters
    extreme: 4, // meters
  },
}

export async function detectAnomalies(sensor: CoastalSensor, reading: SensorReading): Promise<AnomalyAlert[]> {
  const supabase = await createClient()
  const alerts: AnomalyAlert[] = []

  // Threshold anomaly detection
  const thresholdAlerts = await detectThresholdAnomalies(sensor, reading)
  alerts.push(...thresholdAlerts)

  // Rate of change anomaly detection
  const rateChangeAlerts = await detectRateChangeAnomalies(sensor, reading)
  alerts.push(...rateChangeAlerts)

  // Insert alerts into database and send notifications
  for (const alert of alerts) {
    try {
      const { data: insertedAlert, error } = await supabase.from("anomaly_alerts").insert(alert).select().single()
      
      if (error) {
        console.error("Error inserting alert:", error)
        continue
      }

      // Send notifications to subscribed users
      if (insertedAlert) {
        try {
          const notificationService = new NotificationService()
          await notificationService.sendAlertNotifications(insertedAlert.id)
        } catch (notificationError) {
          console.error("Error sending notifications:", notificationError)
          // Don't fail the alert creation if notifications fail
        }
      }
    } catch (error) {
      console.error("Alert insertion error:", error)
    }
  }

  return alerts
}

function detectThresholdAnomalies(sensor: CoastalSensor, reading: SensorReading) {
  const alerts = []
  const thresholds = THRESHOLDS[sensor.sensor_type]

  if (!thresholds) return alerts

  switch (sensor.sensor_type) {
    case "wind_speed":
      if (reading.value >= (thresholds as any).extreme) {
        alerts.push(
          createAlert(
            sensor,
            reading,
            "storm_surge",
            "critical",
            `Extreme wind speeds detected: ${reading.value}${reading.unit}`,
            (thresholds as any).extreme,
          ),
        )
      } else if (reading.value >= thresholds.critical) {
        alerts.push(
          createAlert(
            sensor,
            reading,
            "storm_surge",
            "high",
            `High wind speeds detected: ${reading.value}${reading.unit}`,
            thresholds.critical,
          ),
        )
      } else if (reading.value >= thresholds.high) {
        alerts.push(
          createAlert(
            sensor,
            reading,
            "storm_surge",
            "medium",
            `Elevated wind speeds: ${reading.value}${reading.unit}`,
            thresholds.high,
          ),
        )
      }
      break

    case "wave_height":
      if (reading.value >= (thresholds as any).extreme) {
        alerts.push(
          createAlert(
            sensor,
            reading,
            "extreme_waves",
            "critical",
            `Extreme wave height: ${reading.value}${reading.unit}`,
            (thresholds as any).extreme,
          ),
        )
      } else if (reading.value >= thresholds.critical) {
        alerts.push(
          createAlert(
            sensor,
            reading,
            "extreme_waves",
            "high",
            `High wave height: ${reading.value}${reading.unit}`,
            thresholds.critical,
          ),
        )
      } else if (reading.value >= thresholds.high) {
        alerts.push(
          createAlert(
            sensor,
            reading,
            "extreme_waves",
            "medium",
            `Elevated wave height: ${reading.value}${reading.unit}`,
            thresholds.high,
          ),
        )
      }
      break

    case "temperature":
      if (reading.value >= (thresholds as any).extreme) {
        alerts.push(
          createAlert(
            sensor,
            reading,
            "equipment_failure",
            "critical",
            `Extreme temperature: ${reading.value}${reading.unit}`,
            (thresholds as any).extreme,
          ),
        )
      } else if (reading.value >= thresholds.critical) {
        alerts.push(
          createAlert(
            sensor,
            reading,
            "equipment_failure",
            "high",
            `High temperature: ${reading.value}${reading.unit}`,
            thresholds.critical,
          ),
        )
      } else if (reading.value <= thresholds.low) {
        alerts.push(
          createAlert(
            sensor,
            reading,
            "equipment_failure",
            "medium",
            `Low temperature: ${reading.value}${reading.unit}`,
            thresholds.low,
          ),
        )
      }
      break

    case "water_level":
      if (reading.value >= (thresholds as any).extreme) {
        alerts.push(
          createAlert(
            sensor,
            reading,
            "high_water",
            "critical",
            `Extreme water level: ${reading.value}${reading.unit}`,
            (thresholds as any).extreme,
          ),
        )
      } else if (reading.value >= thresholds.critical) {
        alerts.push(
          createAlert(
            sensor,
            reading,
            "high_water",
            "high",
            `High water level: ${reading.value}${reading.unit}`,
            thresholds.critical,
          ),
        )
      } else if (reading.value >= thresholds.high) {
        alerts.push(
          createAlert(
            sensor,
            reading,
            "high_water",
            "medium",
            `Elevated water level: ${reading.value}${reading.unit}`,
            thresholds.high,
          ),
        )
      }
      break
  }

  return alerts
}

async function detectRateChangeAnomalies(sensor: CoastalSensor, reading: SensorReading) {
  const alerts = []
  const supabase = await createClient()

  // Get previous readings to calculate rate of change
  const { data: previousReadings } = await supabase
    .from("sensor_readings")
    .select("value, timestamp")
    .eq("sensor_id", sensor.id)
    .order("timestamp", { ascending: false })
    .limit(5)

  if (!previousReadings || previousReadings.length < 2) return alerts

  // Calculate rate of change (value per hour)
  const currentTime = new Date(reading.timestamp).getTime()
  const previousTime = new Date(previousReadings[1].timestamp).getTime()
  const timeDiffHours = (currentTime - previousTime) / (1000 * 60 * 60)
  
  if (timeDiffHours < 0.1) return alerts // Skip if less than 6 minutes

  const valueChange = reading.value - previousReadings[1].value
  const rateOfChange = valueChange / timeDiffHours

  // Define rate of change thresholds
  const rateThresholds = {
    wind_speed: { high: 10, critical: 20 }, // mph per hour
    temperature: { high: 5, critical: 10 }, // celsius per hour
    wave_height: { high: 1, critical: 2 }, // meters per hour
    water_level: { high: 0.5, critical: 1 }, // meters per hour
  }

  const thresholds = rateThresholds[sensor.sensor_type]
  if (!thresholds) return alerts

  if (Math.abs(rateOfChange) >= thresholds.critical) {
    alerts.push(
      createAlert(
        sensor,
        reading,
        "equipment_failure",
        "high",
        `Rapid change detected: ${rateOfChange.toFixed(2)}${reading.unit}/hour`,
        thresholds.critical,
        rateOfChange,
      ),
    )
  } else if (Math.abs(rateOfChange) >= thresholds.high) {
    alerts.push(
      createAlert(
        sensor,
        reading,
        "equipment_failure",
        "medium",
        `Unusual change detected: ${rateOfChange.toFixed(2)}${reading.unit}/hour`,
        thresholds.high,
        rateOfChange,
      ),
    )
  }

  return alerts
}

function createAlert(
  sensor: CoastalSensor,
  reading: SensorReading,
  alertType: string,
  severity: string,
  message: string,
  thresholdValue: number,
  actualValue?: number,
): AnomalyAlert {
  return {
    sensor_id: sensor.id,
    alert_type: alertType,
    severity,
    message,
    threshold_value: thresholdValue,
    actual_value: actualValue || reading.value,
    is_resolved: false,
  }
}

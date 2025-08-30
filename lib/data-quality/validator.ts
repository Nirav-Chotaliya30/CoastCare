export interface DataQualityResult {
  isValid: boolean
  qualityScore: number
  issues: string[]
  recommendations: string[]
}

export function validateSensorReading(
  sensorType: string,
  value: number,
  unit: string,
  timestamp: string,
  previousReadings?: Array<{ value: number; timestamp: string }>,
): DataQualityResult {
  const issues: string[] = []
  const recommendations: string[] = []
  let qualityScore = 1.0

  // Range validation
  const ranges = {
    wind_speed: { min: 0, max: 200, unit: "mph" },
    temperature: { min: -50, max: 60, unit: "celsius" },
    wave_height: { min: 0, max: 15, unit: "meters" },
  }

  const range = ranges[sensorType as keyof typeof ranges]
  if (range) {
    if (value < range.min || value > range.max) {
      issues.push(`Value ${value} ${unit} is outside expected range (${range.min}-${range.max} ${range.unit})`)
      qualityScore -= 0.3
    }

    if (unit !== range.unit) {
      issues.push(`Unit mismatch: expected ${range.unit}, got ${unit}`)
      qualityScore -= 0.2
    }
  }

  // Timestamp validation
  const readingTime = new Date(timestamp)
  const now = new Date()
  const timeDiff = Math.abs(now.getTime() - readingTime.getTime()) / (1000 * 60) // minutes

  if (timeDiff > 60) {
    issues.push(`Reading timestamp is ${timeDiff.toFixed(0)} minutes old`)
    qualityScore -= 0.1
  }

  if (readingTime > now) {
    issues.push("Reading timestamp is in the future")
    qualityScore -= 0.2
  }

  // Consistency validation with previous readings
  if (previousReadings && previousReadings.length > 0) {
    const lastReading = previousReadings[0]
    const valueDiff = Math.abs(value - lastReading.value)
    const timeDiffMinutes = Math.abs(readingTime.getTime() - new Date(lastReading.timestamp).getTime()) / (1000 * 60)

    // Check for unrealistic rate of change
    const maxRateOfChange = {
      wind_speed: 20.0, // mph per minute
      temperature: 10.0, // celsius per minute
      wave_height: 1.5, // meters per minute
    }

    const maxRate = maxRateOfChange[sensorType as keyof typeof maxRateOfChange]
    if (maxRate && timeDiffMinutes > 0) {
      const rateOfChange = valueDiff / timeDiffMinutes
      if (rateOfChange > maxRate) {
        issues.push(`Unrealistic rate of change: ${rateOfChange.toFixed(2)} ${unit}/min`)
        qualityScore -= 0.2
      }
    }

    // Check for stuck sensor (same value repeatedly)
    const recentValues = previousReadings.slice(0, 5).map((r) => r.value)
    if (recentValues.length >= 3 && recentValues.every((v) => Math.abs(v - value) < 0.01)) {
      issues.push("Sensor may be stuck (identical readings)")
      qualityScore -= 0.3
    }
  }

  // Generate recommendations
  if (issues.length > 0) {
    recommendations.push("Review sensor calibration and maintenance schedule")

    if (qualityScore < 0.5) {
      recommendations.push("Consider marking sensor for immediate inspection")
    }

    if (issues.some((issue) => issue.includes("stuck"))) {
      recommendations.push("Check sensor for physical obstructions or mechanical failure")
    }

    if (issues.some((issue) => issue.includes("rate of change"))) {
      recommendations.push("Verify sensor mounting and environmental conditions")
    }
  }

  return {
    isValid: qualityScore >= 0.5,
    qualityScore: Math.max(0, qualityScore),
    issues,
    recommendations,
  }
}

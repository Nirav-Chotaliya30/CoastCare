-- Test Real-Time Data System
-- This script helps verify that the real-time data ingestion is working properly

-- Check current sensor data
SELECT 
  'Current Sensor Count' as metric,
  COUNT(*) as value
FROM coastal_sensors 
WHERE status = 'active'
UNION ALL
SELECT 
  'Wind Speed Sensors' as metric,
  COUNT(*) as value
FROM coastal_sensors 
WHERE status = 'active' AND sensor_type = 'wind_speed'
UNION ALL
SELECT 
  'Temperature Sensors' as metric,
  COUNT(*) as value
FROM coastal_sensors 
WHERE status = 'active' AND sensor_type = 'temperature'
UNION ALL
SELECT 
  'Wave Height Sensors' as metric,
  COUNT(*) as value
FROM coastal_sensors 
WHERE status = 'active' AND sensor_type = 'wave_height';

-- Check recent readings (last 24 hours)
SELECT 
  'Recent Readings (24h)' as metric,
  COUNT(*) as value
FROM sensor_readings 
WHERE timestamp >= NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
  'Wind Speed Readings' as metric,
  COUNT(*) as value
FROM sensor_readings sr
JOIN coastal_sensors cs ON sr.sensor_id = cs.id
WHERE sr.timestamp >= NOW() - INTERVAL '24 hours' 
  AND cs.sensor_type = 'wind_speed'
UNION ALL
SELECT 
  'Temperature Readings' as metric,
  COUNT(*) as value
FROM sensor_readings sr
JOIN coastal_sensors cs ON sr.sensor_id = cs.id
WHERE sr.timestamp >= NOW() - INTERVAL '24 hours' 
  AND cs.sensor_type = 'temperature'
UNION ALL
SELECT 
  'Wave Height Readings' as metric,
  COUNT(*) as value
FROM sensor_readings sr
JOIN coastal_sensors cs ON sr.sensor_id = cs.id
WHERE sr.timestamp >= NOW() - INTERVAL '24 hours' 
  AND cs.sensor_type = 'wave_height';

-- Check latest readings for each sensor type
SELECT 
  'Latest Readings by Type' as section,
  '' as metric,
  '' as value
UNION ALL
SELECT 
  'Wind Speed' as section,
  cs.name as metric,
  CONCAT(sr.value, ' ', sr.unit, ' (', sr.timestamp, ')') as value
FROM sensor_readings sr
JOIN coastal_sensors cs ON sr.sensor_id = cs.id
WHERE cs.sensor_type = 'wind_speed'
  AND sr.timestamp = (
    SELECT MAX(timestamp) 
    FROM sensor_readings sr2 
    WHERE sr2.sensor_id = sr.sensor_id
  )
ORDER BY cs.name
UNION ALL
SELECT 
  'Temperature' as section,
  cs.name as metric,
  CONCAT(sr.value, ' ', sr.unit, ' (', sr.timestamp, ')') as value
FROM sensor_readings sr
JOIN coastal_sensors cs ON sr.sensor_id = cs.id
WHERE cs.sensor_type = 'temperature'
  AND sr.timestamp = (
    SELECT MAX(timestamp) 
    FROM sensor_readings sr2 
    WHERE sr2.sensor_id = sr.sensor_id
  )
ORDER BY cs.name
UNION ALL
SELECT 
  'Wave Height' as section,
  cs.name as metric,
  CONCAT(sr.value, ' ', sr.unit, ' (', sr.timestamp, ')') as value
FROM sensor_readings sr
JOIN coastal_sensors cs ON sr.sensor_id = cs.id
WHERE cs.sensor_type = 'wave_height'
  AND sr.timestamp = (
    SELECT MAX(timestamp) 
    FROM sensor_readings sr2 
    WHERE sr2.sensor_id = sr.sensor_id
  )
ORDER BY cs.name;

-- Check for any sensors without recent readings
SELECT 
  'Sensors Without Recent Readings' as section,
  cs.name as metric,
  CONCAT(cs.sensor_type, ' - ', cs.location) as value
FROM coastal_sensors cs
WHERE cs.status = 'active'
  AND NOT EXISTS (
    SELECT 1 
    FROM sensor_readings sr 
    WHERE sr.sensor_id = cs.id 
      AND sr.timestamp >= NOW() - INTERVAL '1 hour'
  )
ORDER BY cs.sensor_type, cs.name;

-- Check active alerts
SELECT 
  'Active Alerts' as section,
  CONCAT(cs.name, ' (', aa.alert_type, ')') as metric,
  CONCAT(aa.severity, ': ', aa.message) as value
FROM anomaly_alerts aa
JOIN coastal_sensors cs ON aa.sensor_id = cs.id
WHERE aa.is_resolved = false
ORDER BY aa.created_at DESC;

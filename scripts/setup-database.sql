-- CoastCare Database Setup Script
-
-- Step 3: Verify the setup
SELECT 
  'coastal_sensors' as table_name,
  COUNT(*) as record_count
FROM coastal_sensors
UNION ALL
SELECT 
  'sensor_readings' as table_name,
  COUNT(*) as record_count
FROM sensor_readings
UNION ALL
SELECT 
  'anomaly_alerts' as table_name,
  COUNT(*) as record_count
FROM anomaly_alerts;

-- Step 4: Show sample data
SELECT 'Sample Sensors:' as info;
SELECT name, location, sensor_type, status FROM coastal_sensors LIMIT 5;

SELECT 'Sample Readings:' as info;
SELECT 
  s.name,
  r.value,
  r.unit,
  r.timestamp
FROM sensor_readings r
JOIN coastal_sensors s ON r.sensor_id = s.id
ORDER BY r.timestamp DESC
LIMIT 5;

SELECT 'Sample Alerts:' as info;
SELECT 
  s.name,
  a.severity,
  a.message,
  a.created_at
FROM anomaly_alerts a
JOIN coastal_sensors s ON a.sensor_id = s.id
ORDER BY a.created_at DESC
LIMIT 5;

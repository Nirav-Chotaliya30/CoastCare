-- Show Only Wave Sensors
-- This script displays all wave height sensors in the database

-- Show all wave sensors
SELECT 'All Wave Sensors:' as info;
SELECT 
    id,
    name,
    location,
    latitude,
    longitude,
    sensor_type,
    status,
    created_at
FROM coastal_sensors 
WHERE sensor_type = 'wave_height'
ORDER BY location, name;

-- Show wave sensor count by location
SELECT 'Wave Sensors by Location:' as info;
SELECT 
    location,
    COUNT(*) as wave_sensor_count,
    STRING_AGG(name, ', ') as sensor_names
FROM coastal_sensors 
WHERE sensor_type = 'wave_height'
GROUP BY location
ORDER BY location;

-- Show wave sensors with their latest readings
SELECT 'Wave Sensors with Latest Readings:' as info;
SELECT 
    s.name,
    s.location,
    s.latitude,
    s.longitude,
    s.status,
    r.value,
    r.unit,
    r.timestamp,
    r.quality_score
FROM coastal_sensors s
LEFT JOIN (
    SELECT DISTINCT ON (sensor_id) 
        sensor_id,
        value,
        unit,
        timestamp,
        quality_score
    FROM sensor_readings
    ORDER BY sensor_id, timestamp DESC
) r ON s.id = r.sensor_id
WHERE s.sensor_type = 'wave_height'
ORDER BY s.location, s.name;

-- Show wave sensors with active alerts
SELECT 'Wave Sensors with Active Alerts:' as info;
SELECT 
    s.name,
    s.location,
    a.severity,
    a.message,
    a.threshold_value,
    a.actual_value,
    a.created_at
FROM coastal_sensors s
JOIN anomaly_alerts a ON s.id = a.sensor_id
WHERE s.sensor_type = 'wave_height'
AND a.is_resolved = false
ORDER BY a.created_at DESC;

-- Summary statistics
SELECT 'Wave Sensor Summary:' as info;
SELECT 
    'Total Wave Sensors' as metric,
    COUNT(*) as value
FROM coastal_sensors 
WHERE sensor_type = 'wave_height'
UNION ALL
SELECT 
    'Active Wave Sensors' as metric,
    COUNT(*) as value
FROM coastal_sensors 
WHERE sensor_type = 'wave_height' AND status = 'active'
UNION ALL
SELECT 
    'Wave Sensors with Readings' as metric,
    COUNT(DISTINCT s.id) as value
FROM coastal_sensors s
JOIN sensor_readings r ON s.id = r.sensor_id
WHERE s.sensor_type = 'wave_height'
UNION ALL
SELECT 
    'Wave Sensors with Alerts' as metric,
    COUNT(DISTINCT s.id) as value
FROM coastal_sensors s
JOIN anomaly_alerts a ON s.id = a.sensor_id
WHERE s.sensor_type = 'wave_height';

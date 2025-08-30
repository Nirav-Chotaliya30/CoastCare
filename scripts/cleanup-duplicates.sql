-- CoastCare Database Cleanup Script
-- This script removes duplicate sensors and keeps only the properly named ones

-- Step 1: Show current duplicate count
SELECT 'BEFORE CLEANUP - Total sensors:' as info, COUNT(*) as count FROM coastal_sensors;

-- Step 2: Identify duplicates by location and sensor type
SELECT 'Duplicate sensors found:' as info;
SELECT 
    location,
    sensor_type,
    COUNT(*) as duplicate_count,
    STRING_AGG(name, ', ') as sensor_names
FROM coastal_sensors 
WHERE status = 'active'
GROUP BY location, sensor_type 
HAVING COUNT(*) > 1
ORDER BY location, sensor_type;

-- Step 3: Delete sensors with old naming pattern (without _Sensor_XX)
-- Keep only sensors with the new naming pattern: Location_SensorType_Sensor_XX
DELETE FROM coastal_sensors 
WHERE name NOT LIKE '%_Sensor_%' 
AND status = 'active'
AND location LIKE '%Gujarat%';

-- Step 4: Delete any remaining duplicates by keeping only the most recent entry per location/sensor_type
DELETE FROM coastal_sensors 
WHERE id NOT IN (
    SELECT DISTINCT ON (location, sensor_type) id
    FROM coastal_sensors
    WHERE status = 'active'
    AND location LIKE '%Gujarat%'
    ORDER BY location, sensor_type, created_at DESC
);

-- Step 5: Show cleanup results
SELECT 'AFTER CLEANUP - Total sensors:' as info, COUNT(*) as count FROM coastal_sensors;

-- Step 6: Show final sensor list
SELECT 'Final sensor list:' as info;
SELECT 
    name,
    location,
    sensor_type,
    status,
    created_at
FROM coastal_sensors 
WHERE status = 'active'
AND location LIKE '%Gujarat%'
ORDER BY location, sensor_type, name;

-- Step 7: Verify no duplicates remain
SELECT 'Verification - No duplicates should exist:' as info;
SELECT 
    location,
    sensor_type,
    COUNT(*) as count
FROM coastal_sensors 
WHERE status = 'active'
AND location LIKE '%Gujarat%'
GROUP BY location, sensor_type 
HAVING COUNT(*) > 1;

-- Step 8: Clean up orphaned readings (readings for deleted sensors)
DELETE FROM sensor_readings 
WHERE sensor_id NOT IN (
    SELECT id FROM coastal_sensors WHERE status = 'active'
);

-- Step 9: Clean up orphaned alerts (alerts for deleted sensors)
DELETE FROM anomaly_alerts 
WHERE sensor_id NOT IN (
    SELECT id FROM coastal_sensors WHERE status = 'active'
);

-- Step 10: Final counts
SELECT 'Final database state:' as info;
SELECT 'coastal_sensors' as table_name, COUNT(*) as record_count FROM coastal_sensors WHERE status = 'active'
UNION ALL
SELECT 'sensor_readings' as table_name, COUNT(*) as record_count FROM sensor_readings
UNION ALL
SELECT 'anomaly_alerts' as table_name, COUNT(*) as record_count FROM anomaly_alerts;

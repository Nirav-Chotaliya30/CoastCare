-- Fix Duplicate Sensors - Targeted Cleanup
-- This script removes the specific duplicates found in your database

-- Step 1: Show current state
SELECT 'Current sensor count:' as info, COUNT(*) as count FROM coastal_sensors WHERE status = 'active';

-- Step 2: Remove old naming pattern sensors (keep only _Sensor_XX pattern)
-- Delete sensors like "Okha Wind", "Porbandar Temperature", etc.
-- Keep sensors like "Okha_Wind_Sensor_01", "Porbandar_Temp_Sensor_08", etc.

DELETE FROM coastal_sensors 
WHERE status = 'active' 
AND location LIKE '%Gujarat%'
AND (
    -- Remove sensors without _Sensor_ pattern
    name NOT LIKE '%_Sensor_%'
    OR
    -- Remove sensors with old naming like "Location Type" instead of "Location_Type_Sensor_XX"
    (name LIKE '%Wind' AND name NOT LIKE '%_Wind_Sensor_%')
    OR
    (name LIKE '%Temperature' AND name NOT LIKE '%_Temp_Sensor_%')
    OR
    (name LIKE '%Waves' AND name NOT LIKE '%_Wave_Sensor_%')
);

-- Step 3: Remove any remaining duplicates by keeping only the most recent entry
-- for each location + sensor_type combination
DELETE FROM coastal_sensors 
WHERE id NOT IN (
    SELECT DISTINCT ON (location, sensor_type) id
    FROM coastal_sensors
    WHERE status = 'active'
    AND location LIKE '%Gujarat%'
    ORDER BY location, sensor_type, created_at DESC
);

-- Step 4: Clean up orphaned data
-- Remove readings for deleted sensors
DELETE FROM sensor_readings 
WHERE sensor_id NOT IN (
    SELECT id FROM coastal_sensors WHERE status = 'active'
);

-- Remove alerts for deleted sensors
DELETE FROM anomaly_alerts 
WHERE sensor_id NOT IN (
    SELECT id FROM coastal_sensors WHERE status = 'active'
);

-- Step 5: Show results
SELECT 'After cleanup - sensor count:' as info, COUNT(*) as count FROM coastal_sensors WHERE status = 'active';

-- Step 6: Show final sensor list
SELECT 'Final sensors:' as info;
SELECT 
    name,
    location,
    sensor_type,
    created_at
FROM coastal_sensors 
WHERE status = 'active'
AND location LIKE '%Gujarat%'
ORDER BY location, sensor_type, name;

-- Step 7: Verify no duplicates
SELECT 'Verification - should be empty if no duplicates:' as info;
SELECT 
    location,
    sensor_type,
    COUNT(*) as count
FROM coastal_sensors 
WHERE status = 'active'
AND location LIKE '%Gujarat%'
GROUP BY location, sensor_type 
HAVING COUNT(*) > 1;

-- Step 8: Show final counts
SELECT 'Final database counts:' as info;
SELECT 'coastal_sensors' as table, COUNT(*) as count FROM coastal_sensors WHERE status = 'active'
UNION ALL
SELECT 'sensor_readings' as table, COUNT(*) as count FROM sensor_readings
UNION ALL
SELECT 'anomaly_alerts' as table, COUNT(*) as count FROM anomaly_alerts;

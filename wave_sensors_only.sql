-- Wave Sensors Only
-- Simple query to show all wave height sensors

SELECT 
    name,
    location,
    latitude,
    longitude,
    status,
    created_at
FROM coastal_sensors 
WHERE sensor_type = 'wave_height'
ORDER BY location, name;

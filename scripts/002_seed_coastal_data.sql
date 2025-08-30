-- Insert Gujarat (India) coastal sensors (wind speed and temperature only)
-- Note: Readings and alerts are no longer seeded; real-time data comes from OpenWeather
INSERT INTO public.coastal_sensors (name, location, latitude, longitude, sensor_type, status) VALUES
('Okha_Wind_Sensor_01', 'Okha, Gujarat', 22.4667, 69.0667, 'wind_speed', 'active'),
('Okha_Temp_Sensor_02', 'Okha, Gujarat', 22.4667, 69.0667, 'temperature', 'active'),
('Okha_Wave_Sensor_03', 'Okha, Gujarat', 22.4667, 69.0667, 'wave_height', 'active'),
('Dwarka_Wind_Sensor_04', 'Dwarka, Gujarat', 22.2400, 68.9670, 'wind_speed', 'active'),
('Dwarka_Temp_Sensor_05', 'Dwarka, Gujarat', 22.2400, 68.9670, 'temperature', 'active'),
('Dwarka_Wave_Sensor_06', 'Dwarka, Gujarat', 22.2400, 68.9670, 'wave_height', 'active'),
('Porbandar_Wind_Sensor_07', 'Porbandar, Gujarat', 21.6417, 69.6139, 'wind_speed', 'active'),
('Porbandar_Temp_Sensor_08', 'Porbandar, Gujarat', 21.6417, 69.6139, 'temperature', 'active'),
('Porbandar_Wave_Sensor_09', 'Porbandar, Gujarat', 21.6417, 69.6139, 'wave_height', 'active'),
('Veraval_Wind_Sensor_10', 'Veraval, Gujarat', 20.9039, 70.3679, 'wind_speed', 'active'),
('Veraval_Temp_Sensor_11', 'Veraval, Gujarat', 20.9039, 70.3679, 'temperature', 'active'),
('Veraval_Wave_Sensor_12', 'Veraval, Gujarat', 20.9039, 70.3679, 'wave_height', 'active'),
('Mundra_Wind_Sensor_13', 'Mundra, Gujarat', 22.8400, 69.7200, 'wind_speed', 'active'),
('Mundra_Temp_Sensor_14', 'Mundra, Gujarat', 22.8400, 69.7200, 'temperature', 'active'),
('Mundra_Wave_Sensor_15', 'Mundra, Gujarat', 22.8400, 69.7200, 'wave_height', 'active'),
('Kandla_Wind_Sensor_16', 'Kandla, Gujarat', 23.0330, 70.2200, 'wind_speed', 'active'),
('Kandla_Temp_Sensor_17', 'Kandla, Gujarat', 23.0330, 70.2200, 'temperature', 'active'),
('Kandla_Wave_Sensor_18', 'Kandla, Gujarat', 23.0330, 70.2200, 'wave_height', 'active'),
('Bhavnagar_Wind_Sensor_19', 'Bhavnagar, Gujarat', 21.7645, 72.1519, 'wind_speed', 'active'),
('Bhavnagar_Temp_Sensor_20', 'Bhavnagar, Gujarat', 21.7645, 72.1519, 'temperature', 'active'),
('Bhavnagar_Wave_Sensor_21', 'Bhavnagar, Gujarat', 21.7645, 72.1519, 'wave_height', 'active'),
('Surat_Wind_Sensor_22', 'Surat, Gujarat', 21.1702, 72.8311, 'wind_speed', 'active'),
('Surat_Temp_Sensor_23', 'Surat, Gujarat', 21.1702, 72.8311, 'temperature', 'active'),
('Surat_Wave_Sensor_24', 'Surat, Gujarat', 21.1702, 72.8311, 'wave_height', 'active');

-- Insert realistic sample sensor readings with proper units and varied values
-- Wind Speed readings (in mph - converted from m/s for consistency)
INSERT INTO public.sensor_readings (sensor_id, value, unit, timestamp, quality_score)
SELECT 
  s.id,
  CASE 
    WHEN s.name = 'Okha_Wind_Sensor_01' THEN 18.5
    WHEN s.name = 'Dwarka_Wind_Sensor_04' THEN 12.3
    WHEN s.name = 'Porbandar_Wind_Sensor_07' THEN 15.7
    WHEN s.name = 'Veraval_Wind_Sensor_10' THEN 22.1
    WHEN s.name = 'Mundra_Wind_Sensor_13' THEN 8.9
    WHEN s.name = 'Kandla_Wind_Sensor_16' THEN 14.2
    WHEN s.name = 'Bhavnagar_Wind_Sensor_19' THEN 11.8
    WHEN s.name = 'Surat_Wind_Sensor_22' THEN 16.4
    ELSE 12.0
  END as value,
  'mph' as unit,
  NOW() - INTERVAL '1 hour' as timestamp,
  0.95 as quality_score
FROM public.coastal_sensors s 
WHERE s.sensor_type = 'wind_speed';

-- Temperature readings (in celsius)
INSERT INTO public.sensor_readings (sensor_id, value, unit, timestamp, quality_score)
SELECT 
  s.id,
  CASE 
    WHEN s.name = 'Okha_Temp_Sensor_02' THEN 28.5
    WHEN s.name = 'Dwarka_Temp_Sensor_05' THEN 31.2
    WHEN s.name = 'Porbandar_Temp_Sensor_08' THEN 29.8
    WHEN s.name = 'Veraval_Temp_Sensor_11' THEN 33.1
    WHEN s.name = 'Mundra_Temp_Sensor_14' THEN 27.4
    WHEN s.name = 'Kandla_Temp_Sensor_17' THEN 30.7
    WHEN s.name = 'Bhavnagar_Temp_Sensor_20' THEN 32.3
    WHEN s.name = 'Surat_Temp_Sensor_23' THEN 34.2
    ELSE 30.0
  END as value,
  'celsius' as unit,
  NOW() - INTERVAL '45 minutes' as timestamp,
  0.98 as quality_score
FROM public.coastal_sensors s 
WHERE s.sensor_type = 'temperature';

-- Wave height readings (in meters)
INSERT INTO public.sensor_readings (sensor_id, value, unit, timestamp, quality_score)
SELECT 
  s.id,
  CASE 
    WHEN s.name = 'Okha_Wave_Sensor_03' THEN 2.1
    WHEN s.name = 'Dwarka_Wave_Sensor_06' THEN 1.8
    WHEN s.name = 'Porbandar_Wave_Sensor_09' THEN 2.5
    WHEN s.name = 'Veraval_Wave_Sensor_12' THEN 1.7
    WHEN s.name = 'Mundra_Wave_Sensor_15' THEN 0.9
    WHEN s.name = 'Kandla_Wave_Sensor_18' THEN 1.4
    WHEN s.name = 'Bhavnagar_Wave_Sensor_21' THEN 1.2
    WHEN s.name = 'Surat_Wave_Sensor_24' THEN 1.6
    ELSE 1.5
  END as value,
  'meters' as unit,
  NOW() - INTERVAL '30 minutes' as timestamp,
  0.92 as quality_score
FROM public.coastal_sensors s 
WHERE s.sensor_type = 'wave_height';

-- Insert sample anomaly alerts for testing
-- These alerts will help test the alerts panel functionality
INSERT INTO public.anomaly_alerts (sensor_id, alert_type, severity, message, threshold_value, actual_value, is_resolved, created_at) 
SELECT 
  s.id,
  'storm_surge' as alert_type,
  'high' as severity,
  'High wind speeds detected: 45 km/h' as message,
  40.0 as threshold_value,
  45.0 as actual_value,
  false as is_resolved,
  NOW() - INTERVAL '2 hours' as created_at
FROM public.coastal_sensors s 
WHERE s.sensor_type = 'wind_speed' AND s.name = 'Okha_Wind_Sensor_01'
LIMIT 1;

INSERT INTO public.anomaly_alerts (sensor_id, alert_type, severity, message, threshold_value, actual_value, is_resolved, created_at) 
SELECT 
  s.id,
  'extreme_waves' as alert_type,
  'critical' as severity,
  'Extreme wave height: 8.5 meters' as message,
  7.0 as threshold_value,
  8.5 as actual_value,
  false as is_resolved,
  NOW() - INTERVAL '1 hour' as created_at
FROM public.coastal_sensors s 
WHERE s.sensor_type = 'wave_height' AND s.name = 'Dwarka_Wave_Sensor_06'
LIMIT 1;

INSERT INTO public.anomaly_alerts (sensor_id, alert_type, severity, message, threshold_value, actual_value, is_resolved, created_at) 
SELECT 
  s.id,
  'equipment_failure' as alert_type,
  'medium' as severity,
  'Temperature sensor showing irregular readings' as message,
  NULL as threshold_value,
  NULL as actual_value,
  false as is_resolved,
  NOW() - INTERVAL '30 minutes' as created_at
FROM public.coastal_sensors s 
WHERE s.sensor_type = 'temperature' AND s.name = 'Porbandar_Temp_Sensor_08'
LIMIT 1;

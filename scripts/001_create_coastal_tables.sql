-- Create coastal sensor data table
CREATE TABLE IF NOT EXISTS public.coastal_sensors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('water_level', 'wave_height', 'wind_speed', 'temperature')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sensor readings table
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID NOT NULL REFERENCES public.coastal_sensors(id) ON DELETE CASCADE,
  value DECIMAL(10, 4) NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  quality_score DECIMAL(3, 2) DEFAULT 1.0 CHECK (quality_score >= 0 AND quality_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create anomaly alerts table
CREATE TABLE IF NOT EXISTS public.anomaly_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id UUID NOT NULL REFERENCES public.coastal_sensors(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('high_water', 'extreme_waves', 'storm_surge', 'equipment_failure')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  threshold_value DECIMAL(10, 4),
  actual_value DECIMAL(10, 4),
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON public.sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON public.sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_sensor_id ON public.anomaly_alerts(sensor_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_created_at ON public.anomaly_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomaly_alerts_severity ON public.anomaly_alerts(severity);

-- Enable Row Level Security
ALTER TABLE public.coastal_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomaly_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is monitoring data)
-- In a production system, you might want more restrictive policies
CREATE POLICY "Allow public read access to sensors" ON public.coastal_sensors FOR SELECT USING (true);
CREATE POLICY "Allow public read access to readings" ON public.sensor_readings FOR SELECT USING (true);
CREATE POLICY "Allow public read access to alerts" ON public.anomaly_alerts FOR SELECT USING (true);

-- Create policies for system inserts (for data ingestion)
CREATE POLICY "Allow system inserts to readings" ON public.sensor_readings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow system inserts to alerts" ON public.anomaly_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow system updates to sensors" ON public.coastal_sensors FOR UPDATE USING (true);
CREATE POLICY "Allow system updates to alerts" ON public.anomaly_alerts FOR UPDATE USING (true);

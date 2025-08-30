-- Setup Email Subscription Tables
-- Run this script to enable email subscription functionality

-- Create users table (if not exists)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user alert subscriptions table
CREATE TABLE IF NOT EXISTS public.user_alert_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sensor_id UUID REFERENCES public.coastal_sensors(id) ON DELETE CASCADE,
  location TEXT, -- If null, subscribe to all locations
  sensor_type TEXT, -- If null, subscribe to all sensor types
  alert_types TEXT[], -- Array of alert types to subscribe to
  severity_levels TEXT[], -- Array of severity levels to subscribe to
  notification_methods TEXT[] DEFAULT ARRAY['email', 'web']::TEXT[], -- email, web, sms, push
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user notifications table (for tracking sent notifications)
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  alert_id UUID NOT NULL REFERENCES public.anomaly_alerts(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.user_alert_subscriptions(id) ON DELETE CASCADE,
  notification_method TEXT NOT NULL, -- email, web, sms, push
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- email, sms, web, push
  subject TEXT,
  template TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_alert_subscriptions_user_id ON public.user_alert_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alert_subscriptions_sensor_id ON public.user_alert_subscriptions(sensor_id);
CREATE INDEX IF NOT EXISTS idx_user_alert_subscriptions_location ON public.user_alert_subscriptions(location);
CREATE INDEX IF NOT EXISTS idx_user_alert_subscriptions_sensor_type ON public.user_alert_subscriptions(sensor_type);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON public.user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_alert_id ON public.user_notifications(alert_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_status ON public.user_notifications(status);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON public.user_notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alert_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow system to manage users" ON public.users FOR ALL USING (true);

-- Create policies for user alert subscriptions
CREATE POLICY "Users can view their own subscriptions" ON public.user_alert_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own subscriptions" ON public.user_alert_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow system to manage subscriptions" ON public.user_alert_subscriptions FOR ALL USING (true);

-- Create policies for user notifications
CREATE POLICY "Users can view their own notifications" ON public.user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow system to manage notifications" ON public.user_notifications FOR ALL USING (true);

-- Create policies for notification templates
CREATE POLICY "Allow public read access to templates" ON public.notification_templates FOR SELECT USING (true);
CREATE POLICY "Allow system to manage templates" ON public.notification_templates FOR ALL USING (true);

-- Insert default notification templates
INSERT INTO public.notification_templates (name, type, subject, template, variables) VALUES
(
  'Alert Email Template',
  'email',
  'Coastal Alert: {severity} - {location}',
  '<h2>Coastal Alert Notification</h2>
  <p><strong>Location:</strong> {location}</p>
  <p><strong>Sensor:</strong> {sensor_name}</p>
  <p><strong>Alert Type:</strong> {alert_type}</p>
  <p><strong>Severity:</strong> {severity}</p>
  <p><strong>Message:</strong> {message}</p>
  <p><strong>Time:</strong> {timestamp}</p>
  <p><strong>Threshold:</strong> {threshold_value} {unit}</p>
  <p><strong>Actual Value:</strong> {actual_value} {unit}</p>
  <hr>
  <p><small>To manage your alert preferences, visit your dashboard.</small></p>',
  '{"location": "", "sensor_name": "", "alert_type": "", "severity": "", "message": "", "timestamp": "", "threshold_value": "", "actual_value": "", "unit": ""}'
),
(
  'Alert SMS Template',
  'sms',
  NULL,
  'ALERT: {severity} {alert_type} at {location}. {message}. Value: {actual_value}{unit}. Time: {timestamp}',
  '{"severity": "", "alert_type": "", "location": "", "message": "", "actual_value": "", "unit": "", "timestamp": ""}'
),
(
  'Alert Web Template',
  'web',
  NULL,
  '{"title": "Coastal Alert", "body": "{message}", "data": {"location": "{location}", "severity": "{severity}", "alert_type": "{alert_type}", "timestamp": "{timestamp}"}}',
  '{"message": "", "location": "", "severity": "", "alert_type": "", "timestamp": ""}'
);

-- Verify the setup
SELECT 
  'users' as table_name,
  COUNT(*) as record_count
FROM users
UNION ALL
SELECT 
  'user_alert_subscriptions' as table_name,
  COUNT(*) as record_count
FROM user_alert_subscriptions
UNION ALL
SELECT 
  'user_notifications' as table_name,
  COUNT(*) as record_count
FROM user_notifications
UNION ALL
SELECT 
  'notification_templates' as table_name,
  COUNT(*) as record_count
FROM notification_templates;

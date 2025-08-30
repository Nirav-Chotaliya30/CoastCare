import { NotificationData } from '@/lib/types/notifications'

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export function generateWelcomeEmailTemplate(userName: string, email: string): EmailTemplate {
  const subject = "Welcome to CoastCare - Your Coastal Alert Subscription"
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CoastCare</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .welcome-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .feature { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌊 Welcome to CoastCare!</h1>
          <p>Your coastal monitoring and alert system</p>
        </div>
        
        <div class="content">
          <div class="welcome-box">
            <h2>Hello ${userName || 'there'}!</h2>
            <p>Thank you for subscribing to CoastCare's coastal alert system. You're now part of our community dedicated to keeping Gujarat's coastline safe and monitored.</p>
          </div>
          
          <h3>What you can expect:</h3>
          
          <div class="feature">
            <strong>📧 Real-time Alerts:</strong> Get instant notifications about storm surges, extreme waves, and other coastal hazards.
          </div>
          
          <div class="feature">
            <strong>📍 Location-based Monitoring:</strong> Receive alerts specific to your area of interest along Gujarat's coastline.
          </div>
          
          <div class="feature">
            <strong>⚡ 24/7 Coverage:</strong> Continuous monitoring across 8 strategic locations in Gujarat.
          </div>
          
          <div class="feature">
            <strong>🔔 Multiple Alert Types:</strong> Storm surges, extreme waves, high water levels, and equipment failures.
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="btn">
              Visit CoastCare Dashboard
            </a>
          </div>
          
          <p><strong>Your subscription details:</strong></p>
          <ul>
            <li>Email: ${email}</li>
            <li>Status: Active</li>
            <li>Notification Method: Email</li>
          </ul>
          
          <p><em>You'll receive your first alert when coastal conditions require attention. Stay safe!</em></p>
        </div>
        
        <div class="footer">
          <p>This is an automated welcome message from CoastCare monitoring system.</p>
          <p>To manage your alert preferences, visit your dashboard.</p>
          <p>© 2024 CoastCare. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Welcome to CoastCare - Your Coastal Alert Subscription

Hello ${userName || 'there'}!

Thank you for subscribing to CoastCare's coastal alert system. You're now part of our community dedicated to keeping Gujarat's coastline safe and monitored.

What you can expect:
- Real-time Alerts: Get instant notifications about storm surges, extreme waves, and other coastal hazards
- Location-based Monitoring: Receive alerts specific to your area of interest along Gujarat's coastline
- 24/7 Coverage: Continuous monitoring across 8 strategic locations in Gujarat
- Multiple Alert Types: Storm surges, extreme waves, high water levels, and equipment failures

Your subscription details:
- Email: ${email}
- Status: Active
- Notification Method: Email

Visit dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}

You'll receive your first alert when coastal conditions require attention. Stay safe!

---
This is an automated welcome message from CoastCare monitoring system.
To manage your alert preferences, visit your dashboard.
© 2024 CoastCare. All rights reserved.
  `

  return { subject, html, text }
}

export function generateAlertEmailTemplate(data: NotificationData): EmailTemplate {
  const subject = `Coastal Alert: ${data.severity.toUpperCase()} - ${data.location}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Coastal Alert</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .alert-box { background: white; border-left: 4px solid #ff6b6b; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .severity-high { border-left-color: #ff6b6b; }
        .severity-medium { border-left-color: #feca57; }
        .severity-low { border-left-color: #48dbfb; }
        .severity-critical { border-left-color: #ff3838; }
        .metric { background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
        .btn { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌊 Coastal Alert Notification</h1>
          <p>Real-time coastal monitoring system</p>
        </div>
        
        <div class="content">
          <div class="alert-box severity-${data.severity}">
            <h2>🚨 ${data.alert_type.replace('_', ' ').toUpperCase()}</h2>
            <p><strong>Severity:</strong> ${data.severity.toUpperCase()}</p>
            <p><strong>Message:</strong> ${data.message}</p>
          </div>
          
          <div class="metric">
            <h3>📍 Location Details</h3>
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Sensor:</strong> ${data.sensor_name}</p>
            <p><strong>Time:</strong> ${data.timestamp}</p>
          </div>
          
          <div class="metric">
            <h3>📊 Sensor Readings</h3>
            <p><strong>Threshold:</strong> ${data.threshold_value} ${data.unit}</p>
            <p><strong>Actual Value:</strong> ${data.actual_value} ${data.unit}</p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="btn">
              View Dashboard
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an automated alert from CoastCare monitoring system.</p>
          <p>To manage your alert preferences, visit your dashboard.</p>
          <p>© 2024 CoastCare. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Coastal Alert: ${data.severity.toUpperCase()} - ${data.location}

ALERT TYPE: ${data.alert_type.replace('_', ' ').toUpperCase()}
SEVERITY: ${data.severity.toUpperCase()}

MESSAGE: ${data.message}

LOCATION DETAILS:
- Location: ${data.location}
- Sensor: ${data.sensor_name}
- Time: ${data.timestamp}

SENSOR READINGS:
- Threshold: ${data.threshold_value} ${data.unit}
- Actual Value: ${data.actual_value} ${data.unit}

View dashboard: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard

---
This is an automated alert from CoastCare monitoring system.
To manage your alert preferences, visit your dashboard.
  `

  return { subject, html, text }
}

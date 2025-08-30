import { createClient } from "@/lib/supabase/server"
import { EmailService } from "@/lib/email/service"
import { NotificationData, UserSubscription } from "@/lib/types/notifications"

export class NotificationService {
  private supabase: any
  private emailService: EmailService

  constructor() {
    this.supabase = null
    this.emailService = new EmailService()
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient()
    }
    return this.supabase
  }

  /**
   * Send notifications for a new alert to all subscribed users
   */
  async sendAlertNotifications(alertId: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()

      // Get the alert details
      const { data: alert, error: alertError } = await supabase
        .from("anomaly_alerts")
        .select(`
          *,
          coastal_sensors (
            name,
            location,
            sensor_type
          )
        `)
        .eq("id", alertId)
        .single()

      if (alertError || !alert) {
        console.error("Error fetching alert:", alertError)
        return
      }

      // Get all active subscriptions that match this alert
      const subscriptions = await this.getMatchingSubscriptions(alert)

      // Send notifications to each subscriber
      for (const subscription of subscriptions) {
        await this.sendNotificationToUser(subscription, alert)
      }
    } catch (error) {
      console.error("Error sending alert notifications:", error)
    }
  }

  /**
   * Get all user subscriptions that match the alert criteria
   */
  private async getMatchingSubscriptions(alert: any): Promise<UserSubscription[]> {
    const supabase = await this.getSupabase()

    const { data: subscriptions, error } = await supabase
      .from("user_alert_subscriptions")
      .select("*")
      .eq("is_active", true)
      .or(
        `sensor_id.eq.${alert.sensor_id},` +
        `location.eq.${alert.coastal_sensors.location},` +
        `sensor_type.eq.${alert.coastal_sensors.sensor_type}`
      )

    if (error) {
      console.error("Error fetching subscriptions:", error)
      return []
    }

    // Filter subscriptions based on alert type and severity
    return (subscriptions || []).filter((sub: any) => {
      const matchesAlertType = !sub.alert_types.length || 
        sub.alert_types.includes(alert.alert_type)
      
      const matchesSeverity = !sub.severity_levels.length || 
        sub.severity_levels.includes(alert.severity)

      return matchesAlertType && matchesSeverity
    })
  }

  /**
   * Send notification to a specific user
   */
  private async sendNotificationToUser(subscription: UserSubscription, alert: any): Promise<void> {
    const supabase = await this.getSupabase()

    // Get user details
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", subscription.user_id)
      .eq("is_active", true)
      .single()

    if (userError || !user) {
      console.error("Error fetching user:", userError)
      return
    }

    // Prepare notification data
    const notificationData: NotificationData = {
      location: alert.coastal_sensors.location,
      sensor_name: alert.coastal_sensors.name,
      alert_type: alert.alert_type,
      severity: alert.severity,
      message: alert.message,
      timestamp: new Date(alert.created_at).toLocaleString(),
      threshold_value: alert.threshold_value,
      actual_value: alert.actual_value,
      unit: this.getUnitForSensorType(alert.coastal_sensors.sensor_type)
    }

    // Send notifications via each method
    for (const method of subscription.notification_methods) {
      await this.sendNotificationByMethod(method, user, subscription, alert, notificationData)
    }
  }

  /**
   * Send notification via specific method
   */
  private async sendNotificationByMethod(
    method: string,
    user: any,
    subscription: UserSubscription,
    alert: any,
    data: NotificationData
  ): Promise<void> {
    const supabase = await this.getSupabase()

    try {
      let success = false
      let errorMessage = ""

      switch (method) {
        case "email":
          success = await this.sendEmailNotification(user, data)
          break
        case "web":
          success = await this.sendWebNotification(user, data)
          break
        case "sms":
          success = await this.sendSMSNotification(user, data)
          break
        case "push":
          success = await this.sendPushNotification(user, data)
          break
        default:
          errorMessage = `Unknown notification method: ${method}`
      }

      // Record the notification attempt
      await supabase.from("user_notifications").insert({
        user_id: user.id,
        alert_id: alert.id,
        subscription_id: subscription.id,
        notification_method: method,
        status: success ? "sent" : "failed",
        sent_at: success ? new Date().toISOString() : null,
        error_message: success ? null : errorMessage
      })

    } catch (error) {
      console.error(`Error sending ${method} notification:`, error)
      
      // Record the failed notification
      await supabase.from("user_notifications").insert({
        user_id: user.id,
        alert_id: alert.id,
        subscription_id: subscription.id,
        notification_method: method,
        status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(user: any, data: NotificationData): Promise<boolean> {
    if (!user.email) {
      console.log("No email address for user:", user.id)
      return false
    }
    
    try {
      const success = await this.emailService.sendAlertEmail(user.email, data)
      if (success) {
        console.log(`Email sent successfully to ${user.email}`)
      } else {
        console.log(`Failed to send email to ${user.email}`)
      }
      return success
    } catch (error) {
      console.error(`Error sending email to ${user.email}:`, error)
      return false
    }
  }

  /**
   * Send web notification (in-app)
   */
  private async sendWebNotification(user: any, data: NotificationData): Promise<boolean> {
    // TODO: Integrate with WebSocket or Server-Sent Events
    console.log(`Sending web notification to user ${user.id}:`, data)
    
    // For now, just log the web notification
    // In production, you would send via WebSocket
    return true
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(user: any, data: NotificationData): Promise<boolean> {
    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    if (!user.phone) {
      console.log("No phone number for user:", user.id)
      return false
    }
    
    console.log(`Sending SMS to ${user.phone}:`, data)
    return true
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(user: any, data: NotificationData): Promise<boolean> {
    // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
    console.log(`Sending push notification to user ${user.id}:`, data)
    return true
  }

  /**
   * Get unit for sensor type
   */
  private getUnitForSensorType(sensorType: string): string {
    switch (sensorType) {
      case "wind_speed":
        return "mph"
      case "temperature":
        return "°C"
      case "wave_height":
        return "meters"
      case "water_level":
        return "meters"
      default:
        return ""
    }
  }

  /**
   * Create a new user subscription
   */
  async createSubscription(subscriptionData: Partial<UserSubscription>): Promise<any> {
    const supabase = await this.getSupabase()
    
    const { data, error } = await supabase
      .from("user_alert_subscriptions")
      .insert(subscriptionData)
      .select()
      .single()

    if (error) {
      console.error("Error creating subscription:", error)
      throw error
    }

    return data
  }

  /**
   * Get user's subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
    const supabase = await this.getSupabase()
    
    const { data, error } = await supabase
      .from("user_alert_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)

    if (error) {
      console.error("Error fetching user subscriptions:", error)
      return []
    }

    return data || []
  }

  /**
   * Update user subscription
   */
  async updateSubscription(subscriptionId: string, updates: Partial<UserSubscription>): Promise<any> {
    const supabase = await this.getSupabase()
    
    const { data, error } = await supabase
      .from("user_alert_subscriptions")
      .update(updates)
      .eq("id", subscriptionId)
      .select()
      .single()

    if (error) {
      console.error("Error updating subscription:", error)
      throw error
    }

    return data
  }

  /**
   * Delete user subscription
   */
  async deleteSubscription(subscriptionId: string): Promise<void> {
    const supabase = await this.getSupabase()
    
    const { error } = await supabase
      .from("user_alert_subscriptions")
      .delete()
      .eq("id", subscriptionId)

    if (error) {
      console.error("Error deleting subscription:", error)
      throw error
    }
  }
}

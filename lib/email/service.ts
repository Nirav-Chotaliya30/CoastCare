import nodemailer from 'nodemailer'
import { NotificationData } from '@/lib/types/notifications'
import { generateAlertEmailTemplate, generateWelcomeEmailTemplate } from './templates'

export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private config: EmailConfig | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    // Get email configuration from environment variables
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }

    // Only create transporter if we have valid credentials
    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.config = emailConfig
      this.transporter = nodemailer.createTransport(emailConfig)
    } else {
      console.warn('Email service not configured. Set SMTP_USER and SMTP_PASS environment variables.')
    }
  }

  /**
   * Send an email notification
   */
  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized')
      return false
    }

    try {
      const mailOptions = {
        from: `"CoastCare Alerts" <${this.config?.auth.user}>`,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', info.messageId)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  /**
   * Generate email template for coastal alert
   */
  generateAlertEmailTemplate(data: NotificationData): EmailTemplate {
    return generateAlertEmailTemplate(data)
  }

  /**
   * Send coastal alert email
   */
  async sendAlertEmail(to: string, data: NotificationData): Promise<boolean> {
    const template = this.generateAlertEmailTemplate(data)
    return this.sendEmail(to, template)
  }

  /**
   * Send welcome email to new subscribers
   */
  async sendWelcomeEmail(to: string, userName?: string): Promise<boolean> {
    const template = generateWelcomeEmailTemplate(userName || '', to)
    return this.sendEmail(to, template)
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false
    }

    try {
      await this.transporter.verify()
      console.log('Email service connection verified')
      return true
    } catch (error) {
      console.error('Email service connection failed:', error)
      return false
    }
  }

  /**
   * Get email service status
   */
  getStatus(): { configured: boolean; connected: boolean } {
    return {
      configured: !!this.config,
      connected: !!this.transporter
    }
  }
}

# Email Notification Setup Guide

This guide explains how to configure email notifications for the CoastCare alert system using Nodemailer.

## Prerequisites

- Node.js and npm installed
- A Gmail account (or other SMTP provider)
- 2-factor authentication enabled on your Gmail account

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Gmail Setup

### 1. Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### 2. Generate App Password
1. Go to Google Account settings
2. Navigate to Security
3. Under "2-Step Verification", click "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Enter "CoastCare" as the name
6. Copy the generated 16-character password
7. Use this password as your `SMTP_PASS`

## Alternative SMTP Providers

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Custom SMTP Server
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
```

## Testing Email Configuration

1. Start your development server
2. Navigate to the email test component
3. Click "Check Status" to verify configuration
4. Enter a test email address
5. Click "Send Test" to send a test email

## Email Templates

The system includes beautiful HTML email templates with:
- Responsive design
- Color-coded severity levels
- Detailed alert information
- Direct links to dashboard
- Professional branding

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Ensure 2FA is enabled
   - Use App Password, not regular password
   - Check email and password are correct

2. **Connection Timeout**
   - Verify SMTP host and port
   - Check firewall settings
   - Try different port (465 with SSL, 587 with TLS)

3. **Email Not Received**
   - Check spam folder
   - Verify recipient email address
   - Check SMTP server logs

### Debug Mode

Enable debug logging by adding to your environment:
```bash
DEBUG=nodemailer:*
```

## Security Considerations

- Never commit `.env` files to version control
- Use App Passwords instead of regular passwords
- Consider using environment-specific configurations
- Regularly rotate App Passwords

## Production Deployment

For production deployment:

1. Use a dedicated email service (SendGrid, AWS SES, etc.)
2. Set up proper DNS records (SPF, DKIM, DMARC)
3. Monitor email delivery rates
4. Implement rate limiting
5. Set up email analytics

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set
3. Test with a simple email client first
4. Contact your email provider's support

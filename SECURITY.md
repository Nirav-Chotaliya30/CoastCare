# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in CoastCare, please follow these steps:

### 1. **DO NOT** create a public GitHub issue
Security vulnerabilities should be reported privately to prevent potential exploitation.

### 2. Email us at security@coastcare.com
Send a detailed email to our security team with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. What to expect
- You'll receive an acknowledgment within 48 hours
- We'll investigate and provide updates
- We'll work on a fix and coordinate disclosure
- You'll be credited in the security advisory (if desired)

### 4. Responsible disclosure timeline
- **Initial response**: 48 hours
- **Status update**: Within 1 week
- **Fix timeline**: Depends on severity (1-4 weeks)
- **Public disclosure**: After fix is deployed

## Security Best Practices

### For Contributors
- Never commit sensitive information (API keys, passwords)
- Use environment variables for configuration
- Follow secure coding practices
- Keep dependencies updated
- Review code for security issues

### For Users
- Keep your environment variables secure
- Use strong, unique passwords
- Enable 2FA where possible
- Regularly update dependencies
- Monitor for suspicious activity

## Security Features

### Data Protection
- All sensitive data is encrypted at rest
- API communications use HTTPS
- Environment variables for configuration
- No sensitive data in logs

### Authentication & Authorization
- Row Level Security (RLS) in Supabase
- Proper access controls
- Session management
- Input validation

### API Security
- Rate limiting
- Input sanitization
- CORS configuration
- Error handling without information disclosure

## Known Vulnerabilities

None at this time.

## Security Updates

Security updates will be released as patch versions (e.g., 1.0.1, 1.0.2) and will be clearly marked in the changelog.

## Contact

- **Security Email**: security@coastcare.com
- **PGP Key**: [Available upon request]
- **Security Team**: CoastCare Security Team

Thank you for helping keep CoastCare secure! 🔒

# Contributing to CoastCare

Thank you for your interest in contributing to CoastCare! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 8+
- Git
- A Supabase account (for development)
- OpenWeather API key (free tier available)

### Development Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/coastcare.git
   cd coastcare
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your credentials
   ```
5. Set up the database:
   ```bash
   # Run in Supabase SQL editor
   \i scripts/001_create_coastal_tables.sql
   \i scripts/002_seed_coastal_data.sql
   \i scripts/004_setup_email_subscriptions.sql
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Code Style

### TypeScript
- Use TypeScript for all new code
- Follow strict TypeScript configuration
- Use proper type annotations
- Avoid `any` type when possible

### React/Next.js
- Use functional components with hooks
- Follow Next.js 13+ App Router conventions
- Use proper error boundaries
- Implement proper loading states

### Styling
- Use Tailwind CSS for styling
- Follow responsive design principles
- Use CSS variables for theming
- Maintain consistent spacing and typography

### File Structure
```
app/                    # Next.js App Router
├── api/               # API routes
├── (routes)/          # Page routes
components/            # Reusable components
├── ui/               # Base UI components
├── dashboard/        # Dashboard-specific components
├── home/             # Home page components
lib/                  # Utility functions and configurations
├── api/              # API client functions
├── supabase/         # Supabase configuration
├── types/            # TypeScript type definitions
scripts/              # Database and setup scripts
```

## 🐛 Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/device information
- Console errors (if any)

## 💡 Feature Requests

When suggesting features:
- Describe the use case
- Explain the benefit
- Provide examples if possible
- Consider implementation complexity

## 🔧 Pull Request Process

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines

3. **Test your changes**:
   ```bash
   npm run build
   npm run lint
   npm run type-check
   ```

4. **Commit your changes** with clear commit messages:
   ```bash
   git commit -m "feat: add new sensor type support"
   git commit -m "fix: resolve email subscription error"
   git commit -m "docs: update README with new features"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** with:
   - Clear title and description
   - List of changes made
   - Screenshots (if UI changes)
   - Testing instructions

## 📋 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Write tests for new features
- Ensure good test coverage
- Use descriptive test names
- Mock external dependencies

## 🔒 Security

- Never commit sensitive information (API keys, passwords)
- Use environment variables for configuration
- Follow security best practices
- Report security issues privately

## 📚 Documentation

- Update README.md for new features
- Add JSDoc comments for functions
- Update API documentation
- Include setup instructions for new features

## 🎯 Areas for Contribution

### High Priority
- [ ] Add more sensor types
- [ ] Implement real-time WebSocket connections
- [ ] Add mobile app support
- [ ] Improve error handling
- [ ] Add unit tests

### Medium Priority
- [ ] Add more visualization options
- [ ] Implement user authentication
- [ ] Add data export functionality
- [ ] Improve accessibility
- [ ] Add internationalization

### Low Priority
- [ ] Add dark mode theme
- [ ] Implement PWA features
- [ ] Add social sharing
- [ ] Create mobile app

## 🤝 Community

- Be respectful and inclusive
- Help other contributors
- Share knowledge and best practices
- Provide constructive feedback

## 📞 Getting Help

- Open an issue for bugs or questions
- Join our community discussions
- Check existing documentation
- Review previous issues and PRs

Thank you for contributing to CoastCare! 🌊

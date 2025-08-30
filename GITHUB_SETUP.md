# GitHub Setup Guide for CoastCare

This guide will help you upload your CoastCare project to GitHub and set up all necessary configurations.

## 📋 Pre-requisites

- [Git](https://git-scm.com/) installed on your system
- [GitHub](https://github.com) account
- [Node.js](https://nodejs.org/) 18+ installed
- CoastCare project ready for upload

## 🚀 Step-by-Step Setup

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Fill in the details:
   - **Repository name**: `coastcare`
   - **Description**: `Real-time coastal monitoring system for Gujarat`
   - **Visibility**: Public (recommended) or Private
   - **Initialize with**: Don't initialize (we'll push existing code)
5. Click "Create repository"

### 2. Run Setup Script

#### Windows
```cmd
scripts\github-setup.bat
```

#### Linux/Mac
```bash
chmod +x scripts/github-setup.sh
./scripts/github-setup.sh
```

### 3. Manual Setup (Alternative)

If you prefer to set up manually:

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial CoastCare coastal monitoring system"

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/coastcare.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔧 Post-Upload Configuration

### 1. Update README.md

Edit `README.md` and replace:
- `your-username` with your actual GitHub username
- Update any project-specific information
- Add your contact information

### 2. Set Up GitHub Secrets (for CI/CD)

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENWEATHER_API_KEY=your_openweather_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 3. Set Up Vercel Deployment

1. Go to [Vercel](https://vercel.com)
2. Sign in with your GitHub account
3. Click **New Project**
4. Import your `coastcare` repository
5. Configure environment variables in Vercel dashboard
6. Deploy!

### 4. Set Up Database

1. Go to your [Supabase](https://supabase.com) project
2. Open the SQL Editor
3. Run these scripts in order:

```sql
-- Create tables
\i scripts/001_create_coastal_tables.sql

-- Seed data
\i scripts/002_seed_coastal_data.sql

-- Set up email subscriptions
\i scripts/004_setup_email_subscriptions.sql
```

## 📁 Repository Structure

Your GitHub repository should now contain:

```
coastcare/
├── .github/
│   └── workflows/
│       └── ci.yml
├── app/
│   ├── api/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── dashboard/
│   ├── home/
│   ├── notifications/
│   └── ui/
├── lib/
│   ├── api/
│   ├── email/
│   ├── supabase/
│   └── types/
├── scripts/
│   ├── 001_create_coastal_tables.sql
│   ├── 002_seed_coastal_data.sql
│   ├── 004_setup_email_subscriptions.sql
│   └── github-setup.bat
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── SECURITY.md
├── CHANGELOG.md
├── env.example
├── package.json
└── tsconfig.json
```

## 🔒 Security Checklist

- [ ] Environment variables are in `.env.local` (not committed)
- [ ] `.env.local` is in `.gitignore`
- [ ] No API keys or passwords in code
- [ ] Database credentials are secure
- [ ] GitHub Secrets are configured
- [ ] Vercel environment variables are set

## 🚀 Deployment Checklist

- [ ] Repository is pushed to GitHub
- [ ] GitHub Secrets are configured
- [ ] Vercel project is created
- [ ] Environment variables are set in Vercel
- [ ] Database is set up in Supabase
- [ ] Domain is configured (optional)
- [ ] SSL certificate is active

## 📞 Support

If you encounter any issues:

1. Check the [README.md](README.md) for detailed setup instructions
2. Review the [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
3. Open an issue on GitHub for bugs or questions
4. Check the [CHANGELOG.md](CHANGELOG.md) for recent changes

## 🎉 Congratulations!

Your CoastCare project is now live on GitHub with:
- ✅ Professional repository structure
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Comprehensive documentation
- ✅ Security policies
- ✅ Contributing guidelines
- ✅ License and changelog
- ✅ Ready for deployment

Happy coding! 🌊

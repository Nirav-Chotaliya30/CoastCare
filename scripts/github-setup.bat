@echo off
REM CoastCare GitHub Repository Setup Script for Windows
REM This script helps you set up your GitHub repository for the CoastCare project

echo 🌊 CoastCare GitHub Repository Setup
echo =====================================

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if we're in a git repository
if not exist ".git" (
    echo 📁 Initializing Git repository...
    git init
)

REM Add all files
echo 📦 Adding files to Git...
git add .

REM Create initial commit
echo 💾 Creating initial commit...
git commit -m "feat: initial CoastCare coastal monitoring system

- Real-time coastal monitoring dashboard
- Wind speed, temperature, and wave height sensors
- Interactive map with sensor locations
- Anomaly detection system
- Alert notifications (browser, sound, visual)
- Data ingestion from OpenWeather API
- Marine data integration
- Email subscription system
- Responsive design with Tailwind CSS
- TypeScript support throughout
- Supabase integration for data storage
- Docker support
- Vercel deployment configuration"

echo ✅ Initial commit created successfully!

REM Ask for GitHub repository URL
echo.
echo 🔗 Please provide your GitHub repository URL:
echo    Example: https://github.com/your-username/coastcare.git
set /p github_url="GitHub URL: "

if not "%github_url%"=="" (
    echo 🔗 Adding remote origin...
    git remote add origin "%github_url%"
    
    echo 🚀 Pushing to GitHub...
    git branch -M main
    git push -u origin main
    
    echo ✅ Successfully pushed to GitHub!
    echo.
    echo 🎉 Your CoastCare repository is now live on GitHub!
    echo.
    echo 📋 Next steps:
    echo 1. Set up GitHub Secrets for CI/CD:
    echo    - Go to Settings ^> Secrets and variables ^> Actions
    echo    - Add your environment variables
    echo.
    echo 2. Set up Vercel deployment:
    echo    - Connect your GitHub repository to Vercel
    echo    - Add environment variables in Vercel dashboard
    echo.
    echo 3. Update README.md:
    echo    - Replace 'your-username' with your actual GitHub username
    echo    - Update any project-specific information
    echo.
    echo 4. Set up database:
    echo    - Run the database setup scripts in Supabase
    echo    - Configure your environment variables
    echo.
    echo 🌊 Happy coding with CoastCare!
) else (
    echo ⚠️  No GitHub URL provided. You can add it later with:
    echo    git remote add origin YOUR_GITHUB_URL
    echo    git push -u origin main
)

pause

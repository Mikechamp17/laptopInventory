@echo off
echo 🚀 Laptop Inventory Tracker - Quick Start
echo ==========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18 or higher first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Check if Angular CLI is installed
ng version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Angular CLI globally...
    npm install -g @angular/cli@17
) else (
    echo ✅ Angular CLI detected
)

REM Install dependencies
echo 📦 Installing project dependencies...
npm install

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Firebase CLI globally...
    npm install -g firebase-tools
) else (
    echo ✅ Firebase CLI detected
)

echo.
echo 🎉 Setup complete! Next steps:
echo.
echo 1. 🔥 Configure Firebase:
echo    - Go to https://console.firebase.google.com/
echo    - Create a new project
echo    - Enable Firestore Database
echo    - Copy your config to src/environments/environment.ts
echo.
echo 2. 🚀 Start the application:
echo    npm start
echo.
echo 3. 🌐 Open your browser to: http://localhost:4200
echo.
echo 📚 For detailed instructions, see README.md
echo.
echo Happy coding! 🎯
pause

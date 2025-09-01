#!/bin/bash

echo "🚀 Laptop Inventory Tracker - Quick Start"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION detected. Please upgrade to v18 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if Angular CLI is installed
if ! command -v ng &> /dev/null; then
    echo "📦 Installing Angular CLI globally..."
    npm install -g @angular/cli@17
else
    echo "✅ Angular CLI detected"
fi

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI globally..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI detected"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. 🔥 Configure Firebase:"
echo "   - Go to https://console.firebase.google.com/"
echo "   - Create a new project"
echo "   - Enable Firestore Database"
echo "   - Copy your config to src/environments/environment.ts"
echo ""
echo "2. 🚀 Start the application:"
echo "   npm start"
echo ""
echo "3. 🌐 Open your browser to: http://localhost:4200"
echo ""
echo "📚 For detailed instructions, see README.md"
echo ""
echo "Happy coding! 🎯"

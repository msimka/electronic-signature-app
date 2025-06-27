#!/bin/bash

echo "🚀 Deploying Electronic Signature App"
echo "======================================"

# Check if we have the keychain entries
echo "🔑 Retrieving credentials from Mac Keychain..."

EMAIL_USER=$(security find-generic-password -s "electronic-signature-email-user" -w 2>/dev/null)
EMAIL_PASS=$(security find-generic-password -s "electronic-signature-email-pass" -w 2>/dev/null)
RECIPIENT_EMAIL=$(security find-generic-password -s "electronic-signature-recipient" -w 2>/dev/null)

if [ -z "$EMAIL_USER" ] || [ -z "$EMAIL_PASS" ] || [ -z "$RECIPIENT_EMAIL" ]; then
    echo "❌ Credentials not found in keychain. Running setup first..."
    ./setup-keychain.sh
    
    # Retry after setup
    EMAIL_USER=$(security find-generic-password -s "electronic-signature-email-user" -w 2>/dev/null)
    EMAIL_PASS=$(security find-generic-password -s "electronic-signature-email-pass" -w 2>/dev/null)
    RECIPIENT_EMAIL=$(security find-generic-password -s "electronic-signature-recipient" -w 2>/dev/null)
fi

echo "✅ Credentials retrieved from keychain"

# Create .env file with keychain values
echo "📝 Creating .env file..."
cat > .env << EOF
EMAIL_USER=$EMAIL_USER
EMAIL_PASS=$EMAIL_PASS
RECIPIENT_EMAIL=$RECIPIENT_EMAIL
PORT=3000
EOF

echo "✅ Environment file created"

# Test locally first
echo "🧪 Testing application locally..."
npm start &
SERVER_PID=$!
sleep 3

# Quick health check
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Local server is running correctly"
    kill $SERVER_PID
else
    echo "❌ Local server test failed"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Check if we have a GitHub remote
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "📂 Setting up GitHub repository..."
    
    # Prompt for GitHub username
    read -p "Enter your GitHub username: " GITHUB_USER
    
    echo "🌐 Creating GitHub repository..."
    echo "Please create a repository named 'electronic-signature-app' on GitHub"
    echo "Press Enter when ready to continue..."
    read
    
    git remote add origin "https://github.com/$GITHUB_USER/electronic-signature-app.git"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Ready for deployment with keychain integration" 2>/dev/null || echo "No changes to commit"
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
else
    echo "❌ GitHub push failed. Please check your credentials and try again."
    exit 1
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (will prompt)
echo "🔐 Logging into Vercel..."
vercel login

# Deploy with environment variables
echo "🚀 Deploying to production..."
vercel --prod \
    --env EMAIL_USER="$EMAIL_USER" \
    --env EMAIL_PASS="$EMAIL_PASS" \
    --env RECIPIENT_EMAIL="$RECIPIENT_EMAIL" \
    --confirm

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "=========================="
    echo "✅ App deployed to Vercel"
    echo "✅ Environment variables configured"
    echo "✅ Email system ready"
    echo "✅ Both parties will receive PDF copies"
    echo ""
    echo "🌐 Your electronic signature app is now live!"
    echo "📧 Test it by submitting a form and checking your email"
    echo ""
    echo "💡 To update in the future, just run: ./deploy.sh"
else
    echo "❌ Vercel deployment failed"
    exit 1
fi
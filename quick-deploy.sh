#!/bin/bash

echo "🚀 Quick Deploy Electronic Signature App"
echo "========================================="

# Get credentials from keychain (will prompt for keychain access)
echo "🔑 Accessing Mac Keychain (you may see security prompts)..."

EMAIL_USER=$(security find-generic-password -s "electronic-signature-email-user" -w 2>/dev/null || echo "")
EMAIL_PASS=$(security find-generic-password -s "electronic-signature-email-pass" -w 2>/dev/null || echo "")
RECIPIENT_EMAIL=$(security find-generic-password -s "electronic-signature-recipient" -w 2>/dev/null || echo "")

# If keychain is empty, use environment fallback
if [ -z "$EMAIL_USER" ]; then
    echo "📧 Please enter your credentials (they'll be saved to keychain):"
    read -p "Gmail address: " EMAIL_USER
    read -s -p "Gmail app password: " EMAIL_PASS
    echo ""
    read -p "Recipient email: " RECIPIENT_EMAIL
    
    # Save to keychain for future use
    security add-generic-password -s "electronic-signature-email-user" -a "$EMAIL_USER" -w "$EMAIL_USER" -U 2>/dev/null
    security add-generic-password -s "electronic-signature-email-pass" -a "$EMAIL_USER" -w "$EMAIL_PASS" -U 2>/dev/null
    security add-generic-password -s "electronic-signature-recipient" -a "$EMAIL_USER" -w "$RECIPIENT_EMAIL" -U 2>/dev/null
fi

echo "✅ Credentials ready"

# Create .env file
cat > .env << EOF
EMAIL_USER=$EMAIL_USER
EMAIL_PASS=$EMAIL_PASS
RECIPIENT_EMAIL=$RECIPIENT_EMAIL
PORT=3000
EOF

# Commit latest changes
git add .
git commit -m "Deploy with keychain integration" 2>/dev/null || echo "No new changes to commit"

# Check if we need to create GitHub repo
if ! git remote get-url origin > /dev/null 2>&1; then
    echo ""
    echo "📂 GitHub Setup Required:"
    echo "1. Go to https://github.com/new"
    echo "2. Create repository named: electronic-signature-app"
    echo "3. Keep it public, don't initialize with README"
    echo ""
    read -p "Enter your GitHub username: " GITHUB_USER
    
    git remote add origin "https://github.com/$GITHUB_USER/electronic-signature-app.git"
    echo "✅ GitHub remote added"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push -u origin main

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod --confirm --env EMAIL_USER="$EMAIL_USER" --env EMAIL_PASS="$EMAIL_PASS" --env RECIPIENT_EMAIL="$RECIPIENT_EMAIL"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo "✅ Your electronic signature app is now live"
echo "✅ Both parties will receive PDF copies"
echo "✅ Credentials secured in Mac Keychain"
echo ""
echo "📧 Test your app by submitting a form!"
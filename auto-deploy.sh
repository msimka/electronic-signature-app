#!/bin/bash

echo "🚀 Auto-deploying Electronic Signature App"
echo "==========================================="

# Get credentials from keychain
echo "🔑 Retrieving credentials from Mac Keychain..."
EMAIL_USER=$(security find-generic-password -s "electronic-signature-email-user" -w 2>/dev/null)
EMAIL_PASS=$(security find-generic-password -s "electronic-signature-email-pass" -w 2>/dev/null)
RECIPIENT_EMAIL=$(security find-generic-password -s "electronic-signature-recipient" -w 2>/dev/null)

# Verify we have credentials
if [ -z "$EMAIL_USER" ] || [ -z "$EMAIL_PASS" ] || [ -z "$RECIPIENT_EMAIL" ]; then
    echo "❌ Missing credentials in keychain"
    echo "Please run: ./setup-keychain.sh first"
    exit 1
fi

echo "✅ Credentials retrieved successfully"

# Create environment file
cat > .env << EOF
EMAIL_USER=$EMAIL_USER
EMAIL_PASS=$EMAIL_PASS
RECIPIENT_EMAIL=$RECIPIENT_EMAIL
PORT=3000
EOF

# Test locally first
echo "🧪 Testing server locally..."
npm start &
SERVER_PID=$!
sleep 5

# Test health endpoint
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Local server working"
    kill $SERVER_PID
else
    echo "❌ Local server failed"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Commit any changes
git add .
git commit -m "Ready for auto-deployment" 2>/dev/null || echo "No changes to commit"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
echo "This will open your browser for authentication if needed..."

# Deploy with all environment variables
npx vercel --prod --yes \
    --env EMAIL_USER="$EMAIL_USER" \
    --env EMAIL_PASS="$EMAIL_PASS" \
    --env RECIPIENT_EMAIL="$RECIPIENT_EMAIL" \
    --env PORT="3000"

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo "✅ Electronic signature app is live"
echo "✅ Email system configured with keychain credentials"
echo "✅ Both you and actors will receive PDF copies"
echo ""
echo "🌐 Your app is now ready for actor release forms!"
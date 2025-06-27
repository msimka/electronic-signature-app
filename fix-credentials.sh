#!/bin/bash

echo "🔧 Fixing Keychain Credentials for Electronic Signature App"
echo "=========================================================="

# Remove any existing entries
echo "🗑️  Clearing old keychain entries..."
security delete-generic-password -s "electronic-signature-email-user" 2>/dev/null || echo "No existing email user entry"
security delete-generic-password -s "electronic-signature-email-pass" 2>/dev/null || echo "No existing email pass entry"
security delete-generic-password -s "electronic-signature-recipient" 2>/dev/null || echo "No existing recipient entry"

echo ""
echo "📧 Please enter your email credentials:"
echo ""

# Get email credentials
read -p "Gmail address (the sender): " EMAIL_USER
echo -n "Gmail app password (16 characters, no spaces): "
read -s EMAIL_PASS
echo ""
read -p "Recipient email (where PDFs should be sent): " RECIPIENT_EMAIL

echo ""
echo "🔐 Storing credentials in Mac Keychain..."

# Store in keychain with proper account names
security add-generic-password -s "electronic-signature-email-user" -a "email-service" -w "$EMAIL_USER" -U
security add-generic-password -s "electronic-signature-email-pass" -a "email-service" -w "$EMAIL_PASS" -U
security add-generic-password -s "electronic-signature-recipient" -a "email-service" -w "$RECIPIENT_EMAIL" -U

echo ""
echo "✅ Credentials stored successfully!"

# Verify storage
echo ""
echo "🔍 Verifying stored credentials..."
STORED_USER=$(security find-generic-password -s "electronic-signature-email-user" -w 2>/dev/null)
STORED_PASS=$(security find-generic-password -s "electronic-signature-email-pass" -w 2>/dev/null)
STORED_RECIPIENT=$(security find-generic-password -s "electronic-signature-recipient" -w 2>/dev/null)

if [ ${#STORED_USER} -gt 0 ] && [ ${#STORED_PASS} -gt 0 ] && [ ${#STORED_RECIPIENT} -gt 0 ]; then
    echo "✅ Email user: ${STORED_USER}"
    echo "✅ Email pass: ****${STORED_PASS: -4}"
    echo "✅ Recipient: ${STORED_RECIPIENT}"
    echo ""
    echo "🎉 Keychain setup complete! Ready to deploy."
else
    echo "❌ Storage verification failed"
    exit 1
fi
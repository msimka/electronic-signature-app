#!/bin/bash

echo "🔑 Setting up Mac Keychain for Electronic Signature App"
echo "======================================================="

# Create keychain entries for email credentials
echo "📧 This will prompt you to enter your email credentials into Mac Keychain..."
echo "   These will be securely stored and accessed automatically."
echo ""

# Prompt for email user
read -p "Enter your Gmail address: " EMAIL_USER

# Prompt for app password (hidden input)
echo -n "Enter your Gmail App Password (16 characters): "
read -s EMAIL_PASS
echo ""

# Prompt for recipient email
read -p "Enter recipient email (where PDFs should be sent): " RECIPIENT_EMAIL

echo ""
echo "🔐 Adding credentials to Mac Keychain..."

# Add email credentials to keychain
security add-generic-password -s "electronic-signature-email-user" -a "$EMAIL_USER" -w "$EMAIL_USER" -U
security add-generic-password -s "electronic-signature-email-pass" -a "$EMAIL_USER" -w "$EMAIL_PASS" -U
security add-generic-password -s "electronic-signature-recipient" -a "$EMAIL_USER" -w "$RECIPIENT_EMAIL" -U

echo "✅ Credentials stored in Mac Keychain successfully!"
echo ""
echo "🔍 You can view/edit these in Keychain Access app under:"
echo "   - electronic-signature-email-user"
echo "   - electronic-signature-email-pass" 
echo "   - electronic-signature-recipient"
echo ""
echo "🚀 Ready for deployment!"
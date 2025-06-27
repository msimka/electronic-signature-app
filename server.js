const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// Email configuration - Replace with your email settings
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Alternative configuration for other email services
// const transporter = nodemailer.createTransport({
//     host: 'smtp.your-provider.com',
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

app.post('/api/submit-document', async (req, res) => {
    try {
        const { fullName, email, date, pdfBase64, timestamp } = req.body;
        
        console.log(`📧 Processing signature submission for ${fullName}`);
        
        // Validate required fields
        if (!fullName || !email || !date || !pdfBase64) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        
        // Check email configuration
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.RECIPIENT_EMAIL) {
            console.error('❌ Email configuration missing');
            return res.status(500).json({
                success: false,
                message: 'Email service not configured'
            });
        }
        
        // Generate filename
        const fileName = `Mastermind_Alliance_Actor_Release_${fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Convert base64 to buffer
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');
        
        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: process.env.RECIPIENT_EMAIL || 'your-recipient@gmail.com', // Your email address
            subject: `Mastermind Alliance Actor Release - ${fullName}`,
            html: `
                <h2>New Actor Release Form Submission</h2>
                <p><strong>Submitted by:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Date:</strong> ${date}</p>
                <p><strong>Submission Time:</strong> ${new Date(timestamp).toLocaleString()}</p>
                
                <p>The signed actor release form is attached as a PDF document.</p>
                
                <hr>
                <p><small>This document was electronically signed and submitted via the Electronic Signature System.</small></p>
            `,
            attachments: [
                {
                    filename: fileName,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };
        
        // Send confirmation email to the signer WITH PDF copy
        const confirmationMailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: email,
            subject: 'Mastermind Alliance Actor Release - Your Signed Copy',
            html: `
                <h2>Your Signed Actor Release Form</h2>
                <p>Dear ${fullName},</p>
                
                <p>Thank you for submitting your Mastermind Alliance Actor Release Form for Promotional Videos. Your electronically signed document is attached to this email for your records.</p>
                
                <p><strong>Document Details:</strong></p>
                <ul>
                    <li>Full Name: ${fullName}</li>
                    <li>Email: ${email}</li>
                    <li>Date Signed: ${date}</li>
                    <li>Submission Time: ${new Date(timestamp).toLocaleString()}</li>
                </ul>
                
                <p><strong>Important:</strong> Please save this PDF copy for your records. This document serves as proof of your agreement to the terms outlined in the Actor Release Form.</p>
                
                <p>If you have any questions about this document or the production, please don't hesitate to contact us.</p>
                
                <p>Best regards,<br>
                Production Team</p>
                
                <hr>
                <p><small>This is an automated email containing your signed legal document. Please keep this email and attachment for your records.</small></p>
            `,
            attachments: [
                {
                    filename: fileName,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };
        
        // Send both emails
        await Promise.all([
            transporter.sendMail(mailOptions),
            transporter.sendMail(confirmationMailOptions)
        ]);
        
        console.log(`✅ Email sent successfully for ${fullName}`);
        
        res.json({ 
            success: true, 
            message: 'Document submitted successfully',
            fileName: fileName,
            timestamp: timestamp
        });
        
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit document',
            error: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve the main HTML file at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Electronic Signature Server running on port ${PORT}`);
    console.log(`📧 Email service configured with: ${process.env.EMAIL_USER || 'default email'}`);
    console.log(`📨 Recipient email: ${process.env.RECIPIENT_EMAIL || 'default recipient'}`);
});

module.exports = app;
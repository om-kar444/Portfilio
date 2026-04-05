const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('=== SERVER STARTING ===');
console.log('Environment variables loaded:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('.'));

// Create transporter using your email configuration
console.log('=== CREATING EMAIL TRANSPORTER ===');
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER || "omkarkurane141@gmail.com",
        pass: process.env.EMAIL_PASS || "rtth eava vfhq wmop"
    }
});

console.log('Transporter created with user:', process.env.EMAIL_USER || "omkarkurane141@gmail.com");

// Test transporter
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ EMAIL TRANSPORTER ERROR:', error);
    } else {
        console.log('✅ EMAIL TRANSPORTER IS READY');
    }
});

// Contact form endpoint
app.post('/send-email', async (req, res) => {
    console.log('=== EMAIL REQUEST RECEIVED ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', req.headers);
    
    try {
        const { name, email, designation, subject, message } = req.body;

        console.log('Extracted fields:');
        console.log('- Name:', name);
        console.log('- Email:', email);
        console.log('- Designation:', designation);
        console.log('- Subject:', subject);
        console.log('- Message length:', message ? message.length : 0);

        if (!name || !email || !designation || !subject || !message) {
            console.log('❌ VALIDATION FAILED - Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        console.log('✅ VALIDATION PASSED - All fields present');
        console.log('=== PREPARING EMAIL ===');

        const mailOptions = {
            from: process.env.EMAIL_USER || "omkarkurane141@gmail.com",
            to: process.env.EMAIL_USER || "omkarkurane141@gmail.com",
            subject: `Portfolio Contact: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">New Contact Message</h2>
                    
                    <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
                        <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p style="margin: 10px 0;"><strong>Role:</strong> <span style="background: #0066cc; color: white; padding: 4px 12px; border-radius: 4px; font-size: 0.9em;">${designation}</span></p>
                        <p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>
                    </div>
                    
                    <div style="background: white; padding: 20px; border-left: 4px solid #0066cc; margin: 20px 0;">
                        <p style="margin: 0; color: #333; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
                    </div>
                    
                    <p style="color: #666; font-size: 0.9em; margin-top: 20px;">
                        Sent from your portfolio contact form
                    </p>
                </div>
            `
        };

        console.log('Mail options prepared:');
        console.log('- From:', mailOptions.from);
        console.log('- To:', mailOptions.to);
        console.log('- Subject:', mailOptions.subject);

        console.log('=== SENDING EMAIL ===');
        const result = await transporter.sendMail(mailOptions);
        console.log('✅ EMAIL SENT SUCCESSFULLY!');
        console.log('Message ID:', result.messageId);
        console.log('Response:', result.response);

        res.status(200).json({
            success: true,
            message: 'Message sent successfully!'
        });

    } catch (error) {
        console.log('❌ EMAIL SENDING FAILED');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.',
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log('=== SERVER STARTED ===');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} in your browser`);
    console.log('=== READY TO RECEIVE REQUESTS ===');
});

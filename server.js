const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('.'));

// Create transporter using your email configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "omkarkurane141@gmail.com",
        pass: "rtth eava vfhq wmop"
    }
});

// Contact form endpoint
app.post('/send-email', async (req, res) => {
    console.log('Received email request:', req.body);
    
    try {
        const { name, email, designation, subject, message } = req.body;

        if (!name || !email || !designation || !subject || !message) {
            console.log('Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        console.log('Attempting to send email...');

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

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);

        res.status(200).json({
            success: true,
            message: 'Message sent successfully!'
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.',
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});

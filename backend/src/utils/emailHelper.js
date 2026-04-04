const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
    console.log(`[EmailHelper] Attempting to send email to: ${email}`);
    
    // Check for required environment variables
    const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const missing = requiredEnv.filter(key => !process.env[key]);
    if (missing.length > 0) {
        console.error(`[EmailHelper] Missing environment variables: ${missing.join(', ')}`);
        return { success: false, error: `Missing environment variables: ${missing.join(', ')}` };
    }

    const port = Number(process.env.SMTP_PORT);
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: port === 465, // Automatically use SSL if port is 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000, 
        greetingTimeout: 10000,
        socketTimeout: 10000,
    });

    const mailOptions = {
        from: `${process.env.FROM_NAME || 'SLIIT Hostel'}<${process.env.EMAIL_FROM}>`,
        to: email,
        subject: subject,
        html: message,
    };

    try {
        console.log('[EmailHelper] Initiating transporter.sendMail...');
        const info = await transporter.sendMail(mailOptions);
        console.log('[EmailHelper] Email sent successfully: ' + info.response);
        return { success: true };
    } catch (error) {
        console.error('[EmailHelper] NODEMAILER ERROR:', error);
        return { success: false, error: error.message };
    }
};

module.exports = sendEmail;

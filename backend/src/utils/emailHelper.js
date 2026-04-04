const nodemailer = require('nodemailer');

const sendEmail = async ({ email, subject, message }) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `${process.env.FROM_NAME}<${process.env.EMAIL_FROM}>`,
        to: email,
        subject: subject,
        html: message,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return { success: true };
    } catch (error) {
        console.error('NODEMAILER ERROR:', error);
        return { success: false, error: error.message };
    }
};

module.exports = sendEmail;

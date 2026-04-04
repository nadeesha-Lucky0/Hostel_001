// backend/src/utils/test-email.js
const sendEmail = require('./emailHelper.js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env if running locally
// In Render, it will use the dashboard environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const testEmail = async () => {
    console.log("------------------------------------------");
    console.log("--- STARTING BREVO API TEST ---");
    console.log("------------------------------------------");
    
    // Check if variables are loaded
    console.log("Checking Environment Variables...");
    console.log("EMAIL_FROM:", process.env.EMAIL_FROM || "MISSING");
    console.log("SMTP_PASS (API Key):", process.env.SMTP_PASS ? "PRESENT (hidden)" : "MISSING");
    console.log("------------------------------------------");

    if (!process.env.SMTP_PASS || !process.env.EMAIL_FROM) {
        console.error("ERROR: Missing required environment variables. Registration cannot proceed.");
        return;
    }

    try {
        console.log("Sending test email to:", process.env.EMAIL_FROM);
        const result = await sendEmail({
            email: process.env.EMAIL_FROM,
            subject: "SLIIT Hostel - Final API Test",
            message: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #4f46e5; border-radius: 10px;">
                    <h1 style="color: #4f46e5;">API Connection Successful!</h1>
                    <p>If you are reading this, your Brevo API configuration on Render is working perfectly.</p>
                    <p>The SMTP port issue has been resolved by switching to HTTPS.</p>
                    <hr />
                    <p style="font-size: 12px; color: #666;">Sent at: ${new Date().toLocaleString()} via Brevo API</p>
                </div>
            `
        });

        if (result.success) {
            console.log("\n✅ SUCCESS: Email sent successfully via API!");
        } else {
            console.error("\n❌ FAILED: Could not send email.");
            console.error("Error Message:", result.error);
            console.log("\nSUGGESTION: Check your SMTP_PASS (API key) and ensure EMAIL_FROM is a verified sender in Brevo.");
        }
    } catch (err) {
        console.error("\n💥 CRITICAL ERROR during test:", err.message);
    }
    console.log("------------------------------------------");
};

testEmail();

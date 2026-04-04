// backend/src/utils/test-email.js
const sendEmail = require('./emailHelper.js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env if running locally
// In Render, it will use the dashboard environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const testEmail = async () => {
    console.log("------------------------------------------");
    console.log("--- STARTING STANDALONE EMAIL TEST ---");
    console.log("------------------------------------------");
    
    // Check if variables are loaded
    console.log("Checking Environment Variables...");
    console.log("SMTP_HOST:", process.env.SMTP_HOST || "MISSING");
    console.log("SMTP_PORT:", process.env.SMTP_PORT || "MISSING");
    console.log("SMTP_USER:", process.env.SMTP_USER || "MISSING");
    console.log("EMAIL_FROM:", process.env.EMAIL_FROM || "MISSING");
    console.log("SMTP_PASS:", process.env.SMTP_PASS ? "PRESENT (hidden)" : "MISSING");
    console.log("------------------------------------------");

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.EMAIL_FROM) {
        console.error("ERROR: Missing required environment variables. Registration cannot proceed.");
        return;
    }

    try {
        console.log("Sending test email to:", process.env.EMAIL_FROM);
        const result = await sendEmail({
            email: process.env.EMAIL_FROM,
            subject: "SLIIT Hostel - Standalone SMTP Test",
            message: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #4f46e5; border-radius: 10px;">
                    <h1 style="color: #4f46e5;">Email Test Successful!</h1>
                    <p>If you are reading this, your SMTP configuration on Render is working perfectly.</p>
                    <hr />
                    <p style="font-size: 12px; color: #666;">Sent at: ${new Date().toLocaleString()}</p>
                </div>
            `
        });

        if (result.success) {
            console.log("\n✅ SUCCESS: Email sent successfully!");
        } else {
            console.error("\n❌ FAILED: Could not send email.");
            console.error("Error Message:", result.error);
            console.log("\nSUGGESTION: If it says 'ETIMEDOUT', try changing SMTP_PORT to 465 in Render.");
            console.log("SUGGESTION: If 'Authentication Failed', double-check your SMTP_PASS.");
        }
    } catch (err) {
        console.error("\n💥 CRITICAL ERROR during test:", err.message);
    }
    console.log("------------------------------------------");
};

testEmail();

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
    const emailFrom = process.env.EMAIL_FROM || "MISSING";
    const smtpPass = (process.env.SMTP_PASS || "").trim();
    
    console.log("EMAIL_FROM:", emailFrom);
    if (smtpPass) {
        const masked = `${smtpPass.substring(0, 4)}...${smtpPass.substring(smtpPass.length - 4)}`;
        console.log(`SMTP_PASS (API Key): ${masked} (Length: ${smtpPass.length})`);
    } else {
        console.log("SMTP_PASS (API Key): MISSING");
    }
    console.log("------------------------------------------");

    if (!smtpPass || emailFrom === "MISSING") {
        console.error("ERROR: Missing required environment variables. Registration cannot proceed.");
        return;
    }

    try {
        console.log("Sending test email to:", emailFrom);
        const result = await sendEmail({
            email: emailFrom,
            subject: "SLIIT Hostel - API Key Verification Test",
            message: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #4f46e5; border-radius: 10px;">
                    <h1 style="color: #4f46e5;">API Key Verified!</h1>
                    <p>If you are reading this, your Brevo API Key is correctly configured on Render.</p>
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
            console.log("\nSUGGESTION: Check your Render logs for the 'Using Key' message and verify the length (usually 84 characters).");
        }
    } catch (err) {
        console.error("\n💥 CRITICAL ERROR during test:", err.message);
    }
    console.log("------------------------------------------");
};

testEmail();

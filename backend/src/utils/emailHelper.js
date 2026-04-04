// backend/src/utils/emailHelper.js

/**
 * Sends an email using Brevo's HTTP API (v3) instead of SMTP.
 * This bypasses SMTP port blocking issues on cloud platforms like Render.
 */
const sendEmail = async ({ email, subject, message }) => {
    console.log(`[EmailHelper] Attempting to send email via API to: ${email}`);
    
    // Check for required environment variables
    // Note: We use process.env.SMTP_PASS as the API key
    if (!process.env.SMTP_PASS || !process.env.EMAIL_FROM) {
        console.error('[EmailHelper] Missing SMTP_PASS (API Key) or EMAIL_FROM in environment.');
        return { success: false, error: 'Internal configuration error: Missing API Key' };
    }

    const apiKey = process.env.SMTP_PASS.trim();
    
    // Log masked key for verification in Render logs
    const maskedKey = `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
    console.log(`[EmailHelper] Using Key: ${maskedKey} (Length: ${apiKey.length})`);

    try {
        console.log('[EmailHelper] Initiating Brevo API request...');
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'api-key': apiKey,
                'x-sib-api-key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sender: { 
                    name: process.env.FROM_NAME || 'SLIIT Hostel', 
                    email: process.env.EMAIL_FROM 
                },
                to: [{ email: email }],
                subject: subject,
                htmlContent: message
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('[EmailHelper] Email sent successfully via API:', data.messageId);
            return { success: true };
        } else {
            console.error('[EmailHelper] Brevo API Error:', data);
            return { 
                success: false, 
                error: `API Error: ${data.message || 'Unknown Brevo API error'}` 
            };
        }
    } catch (error) {
        console.error('[EmailHelper] API FETCH ERROR:', error);
        return { 
            success: false, 
            error: `Network error: ${error.message}` 
        };
    }
};

module.exports = sendEmail;

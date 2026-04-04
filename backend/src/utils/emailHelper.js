// backend/src/utils/emailHelper.js
const https = require('https');

/**
 * Sends an email using Brevo's HTTP API (v3) via native Node.js 'https' module.
 * This is the most robust way to ensure headers are sent correctly to bypass cloud network issues.
 */
const sendEmail = async ({ email, subject, message }) => {
    console.log(`[EmailHelper] Sending email via native HTTPS to: ${email}`);
    
    if (!process.env.SMTP_PASS || !process.env.EMAIL_FROM) {
        console.error('[EmailHelper] Missing SMTP_PASS or EMAIL_FROM.');
        return { success: false, error: 'Internal configuration error: Missing API Key' };
    }

    const apiKey = process.env.SMTP_PASS.trim();
    const payload = JSON.stringify({
        sender: { 
            name: process.env.FROM_NAME || 'SLIIT Hostel', 
            email: process.env.EMAIL_FROM 
        },
        to: [{ email: email }],
        subject: subject,
        htmlContent: message
    });

    return new Promise((resolve) => {
        const options = {
            hostname: 'api.brevo.com',
            port: 443,
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'api-key': apiKey,
                'x-sib-api-key': apiKey,
                'x-api-key': apiKey,
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log('[EmailHelper] SUCCESS:', parsedData.messageId || 'Sent');
                        resolve({ success: true });
                    } else {
                        console.error('[EmailHelper] API ERROR:', parsedData);
                        resolve({ 
                            success: false, 
                            error: `API ${res.statusCode}: ${parsedData.message || 'Unknown error'}` 
                        });
                    }
                } catch (e) {
                    console.error('[EmailHelper] JSON PARSE ERROR:', responseData);
                    resolve({ success: false, error: 'Malformed response from Brevo' });
                }
            });
        });

        req.on('error', (error) => {
            console.error('[EmailHelper] NETWORK ERROR:', error);
            resolve({ success: false, error: `Network error: ${error.message}` });
        });

        req.write(payload);
        req.end();
    });
};

module.exports = sendEmail;

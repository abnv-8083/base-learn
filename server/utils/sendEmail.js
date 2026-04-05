const axios = require('axios');

const sendEmail = async (options) => {
    // Check if the API key is provided
    if (!process.env.BREVO_API_KEY) {
        console.warn("BREVO_API_KEY is missing. Email functionality will be bypassed.");
        return null;
    }

    const fromName = process.env.FROM_NAME || 'Base Learn Education';
    const fromEmail = process.env.FROM_EMAIL || 'your-email@baselearn.com'; 

    try {
        const payload = {
            sender: {
                name: fromName,
                email: fromEmail
            },
            to: [
                { email: options.email }
            ],
            subject: options.subject,
            htmlContent: options.html
        };

        if (options.message) {
            payload.textContent = options.message;
        }

        const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            }
        });

        console.log(`Email successfully routed via Brevo: ${response.data.messageId || 'Success'}`);
        return response.data;
    } catch (error) {
        console.error('Brevo API Error:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = sendEmail;

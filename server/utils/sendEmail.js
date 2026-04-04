const { Resend } = require('resend');

const sendEmail = async (options) => {
    // Check if the API key is provided
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is missing. Email functionality will be bypassed.");
        return null;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const fromName = process.env.FROM_NAME || 'Base Learn Education';
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    try {
        const { data, error } = await resend.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
            text: options.message || '',
        });

        if (error) {
            throw error;
        }

        console.log(`Email successfully routed via Resend: ${data.id}`);
        return data;
    } catch (error) {
        console.error('Resend Error:', error);
        throw error;
    }
};

module.exports = sendEmail;

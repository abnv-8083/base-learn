const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: (process.env.SMTP_PASS || '').replace(/\s/g, '')
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    } else {
        // Fallback for local testing without SMTP details by creating a test account dynamically
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Base Learn Education'} <${process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    try {
        const info = await transporter.sendMail(mailOptions);

        // Automatically log the preview URL to terminal if using the test account
        if (!process.env.SMTP_HOST) {
            console.log(`✉️ Simulated Email sent: ${info.messageId}`);
            console.log(`URL link to view the simulated OTP email safely in your Browser: ${nodemailer.getTestMessageUrl(info)}`);
        } else {
            console.log(`Email successfully routed via SMTP: ${info.messageId}`);
        }
    } catch (error) {
        console.error('Nodemailer Error:', error);
        throw error;
    }
};

module.exports = sendEmail;

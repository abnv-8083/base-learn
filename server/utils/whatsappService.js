const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');

let client;
let qrCodeData = null;
let clientStatus = 'initializing'; // 'initializing', 'qr', 'loading', 'ready', 'authenticated', 'disconnected'

const initializeWhatsApp = () => {
    console.log('[WhatsApp] Initializing...');
    
    client = new Client({
        authStrategy: new LocalAuth({
            dataPath: path.join(__dirname, '../.wwebjs_auth')
        }),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        }
    });

    client.on('qr', async (qr) => {
        console.log('[WhatsApp] QR Received');
        clientStatus = 'qr';
        try {
            qrCodeData = await qrcode.toDataURL(qr);
        } catch (err) {
            console.error('[WhatsApp] QR Generation Error:', err);
        }
    });

    client.on('ready', () => {
        console.log('[WhatsApp] Client is ready!');
        clientStatus = 'ready';
        qrCodeData = null;
    });

    client.on('authenticated', () => {
        console.log('[WhatsApp] Authenticated successfully');
        clientStatus = 'authenticated';
    });

    client.on('auth_failure', (msg) => {
        console.error('[WhatsApp] Auth Failure:', msg);
        clientStatus = 'disconnected';
    });

    client.on('disconnected', (reason) => {
        console.log('[WhatsApp] Client disconnected:', reason);
        clientStatus = 'disconnected';
        // Attempt to re-initialize after a delay
        setTimeout(initializeWhatsApp, 5000);
    });

    client.initialize().catch(err => {
        console.error('[WhatsApp] Initialization Error:', err);
        clientStatus = 'disconnected';
    });
};

const getWhatsAppStatus = () => {
    let wid = null;
    if (client && client.info) {
        wid = client.info.wid ? client.info.wid.user : (client.info.me ? client.info.me.user : null);
    }
    return {
        status: clientStatus,
        qrCode: qrCodeData,
        wid: wid
    };
};

const logoutWhatsApp = async () => {
    console.log('[WhatsApp] Logging out...');
    try {
        if (client) {
            await client.logout();
            // Optional: You could also delete the LocalAuth folder here if you want a complete wipe
        }
    } catch (err) {
        console.error('[WhatsApp] Logout Error:', err);
    } finally {
        clientStatus = 'disconnected';
        qrCodeData = null;
        // Re-initialize to get a new QR code
        setTimeout(initializeWhatsApp, 2000);
    }
};

const sendWhatsAppMessage = async (number, message) => {
    // If no number provided, try to send to mapped number if possible, or handle error
    if (!number && (clientStatus === 'ready' || clientStatus === 'authenticated')) {
        number = client.info.wid.user; // Send to self
    }

    if (clientStatus !== 'ready' && clientStatus !== 'authenticated') {
        throw new Error('WhatsApp client is not ready. Status: ' + clientStatus);
    }

    try {
        console.log(`[WhatsApp] Formatting number: "${number}"`);
        // Format number: remove +, spaces, and ensure it ends with @c.us
        let formattedNumber = number.toString().replace(/[^\d]/g, '');
        
        if (!formattedNumber.endsWith('@c.us') && formattedNumber.length > 0) {
            formattedNumber += '@c.us';
        }

        console.log(`[WhatsApp] Sending to finalized ID: "${formattedNumber}"`);
        
        if (formattedNumber === '@c.us') {
            throw new Error('Invalid WhatsApp number: formatting resulted in empty number');
        }

        await client.sendMessage(formattedNumber, message);
        console.log(`[WhatsApp] Message successfully SENT to ${formattedNumber}`);
        return { success: true };
    } catch (error) {
        console.error('[WhatsApp] Send Message Error:', error);
        throw error;
    }
};

// Start initialization
initializeWhatsApp();

module.exports = {
    getWhatsAppStatus,
    sendWhatsAppMessage,
    logoutWhatsApp
};

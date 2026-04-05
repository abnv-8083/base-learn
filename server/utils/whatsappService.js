const { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const pino = require('pino');

let sock;
let qrCodeData = null;
let clientStatus = 'initializing'; // 'initializing', 'qr', 'loading', 'ready', 'authenticated', 'disconnected', 'error'
let clientError = null;
let wid = null;

const initializeWhatsApp = async () => {
    console.log('[WhatsApp/Baileys] Initializing...');
    clientStatus = 'initializing';
    qrCodeData = null;
    clientError = null;

    try {
        const authPath = path.join(__dirname, '../.wwebjs_auth');
        const { state, saveCreds } = await useMultiFileAuthState(authPath);
        
        // Fetch the absolute latest WhatsApp Web version to prevent 405 (Method Not Allowed) rejections
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`[WhatsApp/Baileys] Using WA v${version.join('.')}, isLatest: ${isLatest}`);

        sock = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            browser: ['BaseLearn Admin', 'Chrome', '1.0.0'], // Safe custom browser footprint
            syncFullHistory: false, // Massive RAM reduction
            logger: pino({ level: 'silent' }) // Disable noisy engine logs
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log('[WhatsApp/Baileys] QR Received');
                clientStatus = 'qr';
                try {
                    qrCodeData = await qrcode.toDataURL(qr);
                } catch (err) {
                    console.error('[WhatsApp/Baileys] QR Generation Error:', err);
                }
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('[WhatsApp/Baileys] connection closed due to ', lastDisconnect.error, ', reconnecting = ', shouldReconnect);
                
                qrCodeData = null;

                if (shouldReconnect) {
                    clientStatus = 'initializing';
                    setTimeout(initializeWhatsApp, 3000);
                } else {
                    clientStatus = 'disconnected';
                    sock = null;
                    clientError = 'Logged out successfully.';
                }
            } else if (connection === 'open') {
                console.log('[WhatsApp/Baileys] Client is ready & authenticated!');
                clientStatus = 'ready';
                qrCodeData = null;
                clientError = null;
                // Baileys IDs are fully qualified e.g. "919000000000:1@s.whatsapp.net". We pull just the phone number.
                if (sock.user && sock.user.id) {
                    wid = sock.user.id.split(':')[0]; 
                }
            }
        });

    } catch (err) {
        console.error('[WhatsApp/Baileys] Initialization Error:', err);
        clientStatus = 'error';
        clientError = err.message || err.toString();
    }
};

const getWhatsAppStatus = () => {
    return {
        status: clientStatus,
        qrCode: qrCodeData,
        wid: wid,
        error: clientError
    };
};

const logoutWhatsApp = async () => {
    console.log('[WhatsApp/Baileys] Logging out and resetting...');
    clientStatus = 'initializing';
    qrCodeData = null;
    
    try {
        if (sock) {
            sock.logout();
        }
    } catch (err) {
        console.error('[WhatsApp/Baileys] Logout Error:', err);
    } finally {
        sock = null;
        
        // Remove auth folder to force a clean slate for the new QR code
        try {
            const authPath = path.join(__dirname, '../.wwebjs_auth');
            if (fs.existsSync(authPath)) {
                fs.rmSync(authPath, { recursive: true, force: true });
            }
        } catch (e) {
            console.error('[WhatsApp/Baileys] Auth wipe error:', e);
        }

        setTimeout(initializeWhatsApp, 2000);
    }
};

const sendWhatsAppMessage = async (number, message) => {
    if (!number && clientStatus === 'ready') {
        number = wid; // Send to self mapping
    }

    if (clientStatus !== 'ready') {
        throw new Error('WhatsApp client is not ready. Status: ' + clientStatus);
    }

    try {
        console.log(`[WhatsApp/Baileys] Formatting number: "${number}"`);
        let formattedNumber = number.toString().replace(/[^\d]/g, '');
        
        // Convert to Baileys protocol standard
        if (!formattedNumber.endsWith('@s.whatsapp.net') && formattedNumber.length > 0) {
            formattedNumber += '@s.whatsapp.net';
        }

        console.log(`[WhatsApp/Baileys] Sending to finalized Jid: "${formattedNumber}"`);
        
        if (formattedNumber === '@s.whatsapp.net') {
            throw new Error('Invalid WhatsApp number: formatting resulted in empty number');
        }

        await sock.sendMessage(formattedNumber, { text: message });
        console.log(`[WhatsApp/Baileys] Message successfully SENT to ${formattedNumber}`);
        return { success: true };
    } catch (error) {
        console.error('[WhatsApp/Baileys] Send Message Error:', error);
        throw error;
    }
};

// Start initialization exactly as before
initializeWhatsApp();

module.exports = {
    getWhatsAppStatus,
    sendWhatsAppMessage,
    logoutWhatsApp
};

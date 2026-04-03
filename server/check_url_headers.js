const http = require('http');

const url = 'http://localhost:6000/uploads/videos/2e195370-cc2f-4796-8b67-5e372531f797.mp4';

const check = async () => {
    const req = http.request(url, { method: 'HEAD' }, (res) => {
        console.log('Status Code:', res.statusCode);
        console.log('Headers:', res.headers);
        res.on('data', () => {});
        res.on('end', () => {
            process.exit(0);
        });
    });

    req.on('error', (e) => {
        console.error('Request Error:', e.message);
        process.exit(1);
    });

    req.end();
};

check();

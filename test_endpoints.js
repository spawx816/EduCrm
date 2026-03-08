const http = require('http');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: '127.0.0.1',
            port: 3000,
            path: path,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }, (res) => {
            let body = '';
            res.on('data', (d) => body += d);
            res.on('end', () => resolve({ status: res.statusCode, body: body.substring(0, 200) }));
        });
        req.on('error', reject);
        req.end();
    });
}

async function main() {
    const endpoints = ['/settings', '/stats/dashboard', '/auth/roles'];
    for (const ep of endpoints) {
        try {
            const r = await makeRequest(ep);
            console.log(`${ep}: Status ${r.status} -> ${r.body}`);
        } catch (e) {
            console.log(`${ep}: ERROR -> ${e.message}`);
        }
    }
}
main();

const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/stats/dashboard',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', body);
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.end();

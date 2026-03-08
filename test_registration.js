const http = require('http');

const data = JSON.stringify({
    first_name: 'Test',
    last_name: 'User',
    email: `test.user.${Date.now()}@example.com`,
    document_type: 'CEDULA',
    document_id: `ID-${Date.now()}`,
    phone: '809-000-0000'
});

const options = {
    hostname: '127.0.0.1',
    port: 3000,
    path: '/students',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
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

req.write(data);
req.end();

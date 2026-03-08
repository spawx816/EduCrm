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
        const data = JSON.parse(body);
        console.log('Revenue (30d):', data.summary.revenue30d);
        console.log('Total Students:', data.summary.totalStudents);
        console.log('Pending Revenue:', data.summary.pendingRevenue);
    });
});

req.on('error', (error) => {
    console.error('Request Error:', error);
});

req.end();

const http = require('http');

const prefix = '/api';
const routes = [
  '/api/billing/test-status',
  '/billing/test-status',
  '/api',
  '/'
];

function check(urlSuffix) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: urlSuffix,
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`URL: http://localhost:3000${urlSuffix} -> Status: ${res.statusCode} -> Body: ${data.trim()}`);
    });
  });

  req.on('error', (error) => {
    console.log(`URL: http://localhost:3000${urlSuffix} -> Error: ${error.message}`);
  });

  req.end();
}

routes.forEach(check);

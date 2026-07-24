const http = require('http');

const data = JSON.stringify({
  email: 'Alminstore@gmail.com',
  newPassword: 'MyNewPassword123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/reset',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Body: ${responseData}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();

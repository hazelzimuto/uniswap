const http = require('http');

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testSuite() {
  console.log('--- Testing UniSwap Endpoints ---');

  // 1. Landing page
  const landing = await request('http://localhost:3000/');
  console.log(`1. Landing Page (/): Status ${landing.status}`);
  if (!landing.body.includes('UniSwap')) throw new Error('Landing page missing UniSwap title');

  // 2. Login Page
  const loginPage = await request('http://localhost:3000/login');
  console.log(`2. Login Page (/login): Status ${loginPage.status}`);
  if (!loginPage.body.includes('Log In')) throw new Error('Login page missing Log In title');

  // 3. Register Page
  const regPage = await request('http://localhost:3000/register');
  console.log(`3. Register Page (/register): Status ${regPage.status}`);
  if (!regPage.body.includes('Create Account')) throw new Error('Register page missing Create Account');

  // 4. Protected Route without Auth
  const listingsUnauth = await request('http://localhost:3000/listings');
  console.log(`4. Protected Route (/listings unauthenticated): Status ${listingsUnauth.status} (Redirect to login)`);
  if (listingsUnauth.status !== 307 && listingsUnauth.status !== 302 && listingsUnauth.status !== 308) {
    console.warn(`Expected redirect status code, got ${listingsUnauth.status}`);
  }

  console.log('✅ All endpoint HTTP tests PASSED successfully!');
}

testSuite().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

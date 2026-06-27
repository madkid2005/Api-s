// test-api.js - نسخه اصلاح شده
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const API_KEY = 'free-key-123';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  }
});

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function logTest(name, status, data) {
  const icon = status ? '✅' : '❌';
  const color = status ? colors.green : colors.red;
  console.log(`${icon} ${color}${name}${colors.reset}`);
  if (data && status) {
    console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 300));
  } else if (data && !status) {
    console.log(`   Error:`, JSON.stringify(data, null, 2).substring(0, 300));
  }
  console.log('');
}

async function testAPI() {
  console.log('\n🚀 Starting API Tests...\n');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🔑 API Key: ${API_KEY}\n`);
  console.log('='.repeat(60) + '\n');

  // 1. Root
  console.log(`${colors.blue}📋 1. Testing Root (Home)${colors.reset}`);
  try {
    const response = await axios.get(BASE_URL);
    logTest('Root endpoint', true, response.data);
  } catch (err) {
    logTest('Root endpoint', false, err.response?.data || err.message);
  }

  // 2. Shortener - Create (JSON)
  console.log(`${colors.blue}🔗 2. Testing Shortener API${colors.reset}`);
  try {
    const response = await api.post('/shortener/create', {
      url: 'https://example.com/very/long/url'
    });
    logTest('Shortener - Create', true, response.data);
  } catch (err) {
    logTest('Shortener - Create', false, err.response?.data || err.message);
  }

  // 3. Screenshot (JSON)
  console.log(`${colors.blue}📸 3. Testing Screenshot API${colors.reset}`);
  try {
    const response = await api.post('/screenshot/capture', {
      url: 'https://example.com'
    });
    logTest('Screenshot - Capture', true, response.data);
  } catch (err) {
    logTest('Screenshot - Capture', false, err.response?.data || err.message);
  }

  // 4. QR Code (JSON)
  console.log(`${colors.blue}📱 4. Testing QR Code API${colors.reset}`);
  try {
    const response = await api.post('/qrcode/generate', {
      text: 'https://example.com'
    });
    logTest('QR Code - Generate', true, response.data);
  } catch (err) {
    logTest('QR Code - Generate', false, err.response?.data || err.message);
  }

  // 5. Domain (JSON)
  console.log(`${colors.blue}🌐 5. Testing Domain API${colors.reset}`);
  try {
    const response = await api.post('/domain/check', {
      domain: 'example.com'
    });
    logTest('Domain - Check', true, response.data);
  } catch (err) {
    logTest('Domain - Check', false, err.response?.data || err.message);
  }

  // 6. News (GET - no body)
  console.log(`${colors.blue}📰 6. Testing News API${colors.reset}`);
  try {
    const response = await api.get('/news/fetch');
    logTest('News - Fetch', true, response.data);
  } catch (err) {
    logTest('News - Fetch', false, err.response?.data || err.message);
  }

  // 7. Ecommerce (GET - no body)
  console.log(`${colors.blue}🛒 7. Testing Ecommerce API${colors.reset}`);
  try {
    const response = await api.get('/ecommerce/products');
    logTest('Ecommerce - Products', true, response.data);
  } catch (err) {
    logTest('Ecommerce - Products', false, err.response?.data || err.message);
  }

  // 8. Mock Data (GET - no body)
  console.log(`${colors.blue}🎭 8. Testing Mock Data API${colors.reset}`);
  try {
    const response = await api.get('/mock/users');
    logTest('Mock - Users', true, response.data);
  } catch (err) {
    logTest('Mock - Users', false, err.response?.data || err.message);
  }

  // 9. Monitor (JSON)
  console.log(`${colors.blue}📊 9. Testing Monitor API${colors.reset}`);
  try {
    const response = await api.post('/monitor/add', {
      url: 'https://example.com'
    });
    logTest('Monitor - Add', true, response.data);
  } catch (err) {
    logTest('Monitor - Add', false, err.response?.data || err.message);
  }

  // 10. Email (JSON)
  console.log(`${colors.blue}📧 10. Testing Email API${colors.reset}`);
  try {
    const response = await api.post('/email/validate', {
      email: 'test@example.com'
    });
    logTest('Email - Validate', true, response.data);
  } catch (err) {
    logTest('Email - Validate', false, err.response?.data || err.message);
  }

  // 11. تست بدون API Key
  console.log(`${colors.blue}🔒 11. Testing Auth (No API Key)${colors.reset}`);
  try {
    await axios.post(`${BASE_URL}/shortener/create`, {
      url: 'https://example.com'
    });
    logTest('Auth - No Key (Should fail)', false, 'Server allowed request without API key!');
  } catch (err) {
    logTest('Auth - No Key (Expected failure)', true, err.response?.status + ': ' + err.response?.data?.message);
  }

  console.log('='.repeat(60));
  console.log(`${colors.green}✅ All tests completed!${colors.reset}\n`);
}

// نصب form-data: npm install form-data --save-dev
// اجرا: node test-api.js

testAPI();
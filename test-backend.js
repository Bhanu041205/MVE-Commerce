#!/usr/bin/env node

/**
 * Backend Connectivity Test Script
 * Tests if the backend is responding correctly to auth endpoints
 */

const axios = require('axios');

const API_URL = 'http://localhost:6969/api';

async function testBackend() {
  console.log('\n🧪 Testing MVE Commerce Backend...\n');
  console.log(`API URL: ${API_URL}\n`);

  try {
    // Test 1: Check if backend is running
    console.log('1️⃣  Testing backend connection...');
    try {
      const healthCheck = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: 'Bearer invalid' },
        timeout: 5000
      }).catch(err => err.response);
      
      if (healthCheck?.status) {
        console.log('✅ Backend is running and responding!\n');
      }
    } catch (error) {
      console.log('❌ Backend connection failed');
      console.log('   Make sure backend is running on port 6969\n');
      return;
    }

    // Test 2: Test login with demo credentials
    console.log('2️⃣  Testing login with demo credentials...');
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'customer@demo.com',
        password: 'password123'
      }, { timeout: 5000 });

      if (loginResponse.data?.token && loginResponse.data?.user) {
        console.log('✅ Login endpoint works correctly!');
        console.log('   Response format is correct.\n');
        console.log('   Token:', loginResponse.data.token.substring(0, 20) + '...');
        console.log('   User:', JSON.stringify(loginResponse.data.user, null, 2));
      } else {
        console.log('⚠️  Login returned but response format is unexpected:');
        console.log('   ' + JSON.stringify(loginResponse.data, null, 2) + '\n');
      }
    } catch (error) {
      console.log('❌ Login failed:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message);
      console.log('   Response:', JSON.stringify(error.response?.data, null, 2) + '\n');
    }

    // Test 3: Test registration
    console.log('3️⃣  Testing registration endpoint...');
    const newEmail = `test-${Date.now()}@example.com`;
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, {
        email: newEmail,
        password: 'TestPass123!',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890'
      }, { timeout: 5000 });

      if (registerResponse.status === 200 || registerResponse.status === 201) {
        console.log('✅ Registration endpoint works!');
        console.log('   Response:', JSON.stringify(registerResponse.data, null, 2) + '\n');
      }
    } catch (error) {
      console.log('⚠️  Registration endpoint issue:');
      console.log('   Status:', error.response?.status);
      console.log('   Message:', error.response?.data?.message || error.message + '\n');
    }

    console.log('\n✨ Backend Testing Complete!\n');

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

testBackend();

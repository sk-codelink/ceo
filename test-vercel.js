// test-vercel.js
// Simple test script for Vercel deployment

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

async function testVercelAPI() {
  console.log('🧪 Testing Evo AI Vercel Deployment...\n');
  console.log(`🌐 Base URL: ${BASE_URL}\n`);

  const tests = [
    {
      name: 'Health Check',
      url: '/api/ping',
      method: 'GET'
    },
    {
      name: 'Debate Service',
      url: '/api/evo/debate',
      method: 'POST',
      body: { topic: 'Was Jesus a Muslim?' }
    },
    {
      name: 'Expert Service',
      url: '/api/evo/expert',
      method: 'POST',
      body: { 
        requestText: 'Explain quantum computing basics',
        domain: 'technology' 
      }
    },
    {
      name: 'Generate Data',
      url: '/api/generate',
      method: 'POST',
      body: { data: 'Test optimization data' }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`🔍 Testing ${test.name}...`);
      
      const options = {
        method: test.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(`${BASE_URL}${test.url}`, options);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${test.name} passed`);
        console.log(`   Status: ${response.status}`);
        if (data.reply) console.log(`   Reply: ${data.reply.substring(0, 50)}...`);
        if (data.status) console.log(`   Status: ${data.status}`);
      } else {
        console.log(`❌ ${test.name} failed: ${data.error}`);
      }
      
    } catch (error) {
      console.log(`❌ ${test.name} error: ${error.message}`);
    }
    console.log('');
  }
  
  console.log('🎉 Testing complete!');
}

// Run if called directly
if (typeof window === 'undefined') {
  testVercelAPI().catch(console.error);
}

export default testVercelAPI; 
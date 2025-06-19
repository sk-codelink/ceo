// test-all-apis.js
// Comprehensive API testing for all endpoints

const BASE_URL = process.env.VERCEL_URL || 'http://localhost:3000';

const testCases = [
  // 1. Basic endpoints
  {
    name: 'Ping API',
    endpoint: '/api/ping',
    method: 'GET',
    expected: 'pong'
  },
  
  // 2. Chat Optimizer endpoints
  {
    name: 'Generate API',
    endpoint: '/api/generate',
    method: 'POST',
    body: { prompt: 'Hello world', tier: 'free' }
  },
  {
    name: 'Optimize API',
    endpoint: '/api/optimize',
    method: 'POST', 
    body: { text: 'make this better', tier: 'free' }
  },

  // 3. EVO System endpoints
  {
    name: 'Debate API',
    endpoint: '/api/evo/debate',
    method: 'POST',
    body: { topic: 'who created gravity?' }
  },
  {
    name: 'Expert API',
    endpoint: '/api/evo/expert',
    method: 'POST',
    body: { request: 'explain quantum physics', domain: 'physics' }
  },
  {
    name: 'Swarm API',
    endpoint: '/api/evo/swarm',
    method: 'POST',
    body: { task: 'analyze market trends', payload: {} }
  },
  {
    name: 'Theological Query API',
    endpoint: '/api/evo/theological-query',
    method: 'POST',
    body: { query: 'purpose of life', tradition: 'christian' }
  },
  {
    name: 'Generate Code API',
    endpoint: '/api/evo/generate-code',
    method: 'POST',
    body: { request: 'create a hello world function', language: 'javascript' }
  },
  {
    name: 'Generate Tool API',
    endpoint: '/api/evo/generate-tool',
    method: 'POST',
    body: { request: 'password generator', toolName: 'PassGen' }
  },

  // 4. Creator Response API (NEW)
  {
    name: 'Creator Response API',
    endpoint: '/api/creator-response',
    method: 'POST',
    body: { subject: 'gravity', preferredName: 'Jesus Christ' }
  },

  // 5. Truth Enforcement APIs
  {
    name: 'Truth Ask API',
    endpoint: '/api/truth/ask',
    method: 'POST',
    body: { question: 'What is the meaning of life?' }
  },
  {
    name: 'Truth Stats API',
    endpoint: '/api/truth/stats',
    method: 'GET'
  },

  // 6. Authentication
  {
    name: 'Login API',
    endpoint: '/api/auth/login',
    method: 'POST',
    body: { username: 'admin', password: 'test123' }
  }
];

async function runTests() {
  console.log('🚀 Starting comprehensive API tests...\n');
  
  const results = [];
  
  for (const test of testCases) {
    try {
      console.log(`Testing: ${test.name}`);
      
      const options = {
        method: test.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const response = await fetch(`${BASE_URL}${test.endpoint}`, options);
      const data = await response.json();
      
      const result = {
        name: test.name,
        endpoint: test.endpoint,
        status: response.status,
        success: response.ok,
        data: data
      };
      
      results.push(result);
      
      if (response.ok) {
        console.log(`✅ ${test.name} - SUCCESS (${response.status})`);
      } else {
        console.log(`❌ ${test.name} - FAILED (${response.status}): ${data.error}`);
      }
      
    } catch (error) {
      console.log(`💥 ${test.name} - ERROR: ${error.message}`);
      results.push({
        name: test.name,
        endpoint: test.endpoint,
        success: false,
        error: error.message
      });
    }
    
    console.log(''); // Empty line for readability
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log('📊 TEST SUMMARY:');
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful === total) {
    console.log('🎉 ALL TESTS PASSED! System is fully operational!');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above.');
  }
  
  return results;
}

// Export for use in other files
export { runTests, testCases };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
} 
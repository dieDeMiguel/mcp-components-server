#!/usr/bin/env node

const BASE_URL = 'https://meli-xmcp-poc.vercel.app/mcp';

async function testMCPEndpoint(testName, payload) {
  console.log(`\n🧪 Testing: ${testName}`);
  console.log('📤 Request:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log('📥 Response:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.log('❌ Test failed with error');
      return false;
    } else {
      console.log('✅ Test passed');
      return true;
    }
  } catch (error) {
    console.log('❌ Test failed with exception:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting VCP Integration Tests\n');
  
  const tests = [
    {
      name: 'List all components',
      payload: {
        jsonrpc: "2.0",
        id: "test-1",
        method: "tools/call",
        params: {
          name: "list_components",
          arguments: {}
        }
      }
    },
    {
      name: 'List components with query filter',
      payload: {
        jsonrpc: "2.0",
        id: "test-2", 
        method: "tools/call",
        params: {
          name: "list_components",
          arguments: {
            query: "button"
          }
        }
      }
    },
    {
      name: 'Get Button component',
      payload: {
        jsonrpc: "2.0",
        id: "test-3",
        method: "tools/call", 
        params: {
          name: "get_component",
          arguments: {
            name: "Button"
          }
        }
      }
    },
    {
      name: 'Get Badge component',
      payload: {
        jsonrpc: "2.0",
        id: "test-4",
        method: "tools/call",
        params: {
          name: "get_component", 
          arguments: {
            name: "Badge"
          }
        }
      }
    },
    {
      name: 'Get non-existent component',
      payload: {
        jsonrpc: "2.0",
        id: "test-5",
        method: "tools/call",
        params: {
          name: "get_component",
          arguments: {
            name: "NonExistent"
          }
        }
      }
    },
    {
      name: 'Check tools discovery',
      payload: {
        jsonrpc: "2.0",
        id: "test-6",
        method: "tools/list",
        params: {}
      }
    }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const success = await testMCPEndpoint(test.name, test.payload);
    if (success) passed++;
  }
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! VCP integration is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Check the output above.');
  }
}

runAllTests().catch(console.error);

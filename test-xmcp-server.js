#!/usr/bin/env node

/**
 * Test script for the real xmcp server
 * Run with: node test-xmcp-server.js
 */

const BASE_URL = 'http://localhost:3001';

async function testMCPEndpoint(name, method, params = {}) {
  console.log(`\n🧪 Testing ${name}...`);
  
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    });

    if (!response.ok) {
      console.log(`❌ ${name}: HTTP ${response.status}`);
      const text = await response.text();
      console.log(`   Response: ${text.substring(0, 200)}...`);
      return;
    }

    const data = await response.json();
    
    if (data.error) {
      console.log(`❌ ${name}: MCP Error`);
      console.log(`   Error: ${data.error.message || JSON.stringify(data.error)}`);
    } else {
      console.log(`✅ ${name}: SUCCESS`);
      if (data.result) {
        // Try to parse the result if it's JSON text
        try {
          if (data.result.content && data.result.content[0] && data.result.content[0].text) {
            const parsed = JSON.parse(data.result.content[0].text);
            if (parsed.items) {
              console.log(`   Items: ${parsed.items.length}`);
            } else if (parsed.component) {
              console.log(`   Component: ${parsed.component.name}`);
            } else if (parsed.error) {
              console.log(`   Error: ${parsed.error}`);
            }
          }
        } catch (e) {
          console.log(`   Result: ${JSON.stringify(data.result).substring(0, 100)}...`);
        }
      }
    }
  } catch (error) {
    console.log(`❌ ${name}: Network Error`);
    console.log(`   ${error.message}`);
  }
}

async function testServerHealth() {
  console.log('⚡ Checking if xmcp server is running...');
  
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0',
          },
        },
      }),
    });
    
    if (response.ok) {
      console.log('✅ xmcp server is running!');
      return true;
    }
  } catch (error) {
    console.log('❌ xmcp server not accessible');
    console.log(`   Error: ${error.message}`);
    return false;
  }
  
  return false;
}

async function runTests() {
  console.log('🚀 Starting xmcp Server Tests');
  console.log(`📡 Base URL: ${BASE_URL}`);
  
  // Test MCP protocol methods
  await testMCPEndpoint('Initialize', 'initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0',
    },
  });
  
  await testMCPEndpoint('List Tools', 'tools/list');
  
  // Test our custom tools
  await testMCPEndpoint('List All Components', 'tools/call', {
    name: 'list_components',
    arguments: {},
  });
  
  await testMCPEndpoint('Search Components', 'tools/call', {
    name: 'list_components',
    arguments: {
      query: 'button',
    },
  });
  
  await testMCPEndpoint('Filter by Tags', 'tools/call', {
    name: 'list_components',
    arguments: {
      tags: ['button', 'action'],
    },
  });
  
  await testMCPEndpoint('Get Button Component', 'tools/call', {
    name: 'get_component',
    arguments: {
      name: 'Button',
    },
  });
  
  await testMCPEndpoint('Get Button with Variant', 'tools/call', {
    name: 'get_component',
    arguments: {
      name: 'Button',
      variant: 'primary',
    },
  });
  
  await testMCPEndpoint('Get Invalid Component', 'tools/call', {
    name: 'get_component',
    arguments: {
      name: 'InvalidComponent',
    },
  });
  
  console.log('\n🏁 xmcp Server Tests completed!');
}

// Main execution
(async () => {
  const healthy = await testServerHealth();
  if (!healthy) {
    console.log('💡 Please ensure the xmcp server is running: pnpm dev');
    process.exit(1);
  }
  
  await runTests();
})();

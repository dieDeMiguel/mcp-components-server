import { type Middleware } from "xmcp";

const middleware: Middleware = async (req, res, next) => {
  // Log para debugging
  console.log(`${req.method} ${req.url}`, {
    origin: req.headers.origin,
    authorization: req.headers.authorization ? 'Bearer ***' : 'None',
    userAgent: req.headers['user-agent']
  });

  // Configurar CORS headers para todas las requests
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With, mcp-session-id, mcp-protocol-version');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400');

  // Manejar requests OPTIONS preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  // Verificar autenticación solo en producción para requests POST
  if (req.method === 'POST' && process.env.NODE_ENV === 'production') {
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.MCP_AUTH_TOKEN || process.env.MCP_PRODUCTION_TOKEN;
    
    if (!expectedToken) {
      console.warn('⚠️  MCP_AUTH_TOKEN not configured in production');
      // En desarrollo, permitir sin autenticación
      return next();
    }
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid Authorization header');
      return res.status(401).json({
        jsonrpc: '2.0',
        error: { 
          code: -32000, 
          message: 'Unauthorized - Missing Bearer token' 
        },
        id: null
      });
    }
    
    const token = authHeader.substring(7);
    if (token !== expectedToken) {
      console.log('❌ Invalid token provided');
      return res.status(401).json({
        jsonrpc: '2.0',
        error: { 
          code: -32000, 
          message: 'Unauthorized - Invalid token' 
        },
        id: null
      });
    }
    
    console.log('✅ Authentication successful');
  }

  // Para desarrollo, permitir todo
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Development mode - bypassing authentication');
  }

  return next();
};

export default middleware;
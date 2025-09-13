import { type Middleware } from "xmcp";

const middleware: Middleware = async (req, res, next) => {
  // Log para debugging
  console.log(`🔍 ${req.method} ${req.url}`, {
    origin: req.headers.origin,
    authorization: req.headers.authorization ? 'Bearer ***' : 'None',
    env: process.env.NODE_ENV
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

  // Por ahora, deshabilitamos la autenticación para que VCP funcione
  // TODO: Implementar autenticación opcional cuando VCP soporte tokens
  console.log('🔧 Bypassing authentication for VCP compatibility');
  
  return next();
};

export default middleware;
import { type Middleware } from "xmcp";

const middleware: Middleware = async (req, res, next) => {
  // Log para debugging
  console.log(`🔍 ${req.method} ${req.url}`, {
    origin: req.headers.origin,
    env: process.env.NODE_ENV
  });

  // Configurar CORS headers para todas las requests - permitir todo sin restricciones
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Access-Control-Max-Age', '86400');

  // Manejar requests OPTIONS preflight
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight request');
    return res.status(200).end();
  }

  // Sin autenticación - acceso completamente abierto
  console.log('🔓 No authentication - open access');
  
  return next();
};

export default middleware;
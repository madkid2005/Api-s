const fs = require('fs').promises;
const path = require('path');

// Simple tracking middleware
function trackingMiddleware(fastify) {
  const logDir = path.join(__dirname, '../../logs');
  
  // Ensure logs directory exists
  fs.mkdir(logDir, { recursive: true }).catch(() => {});
  
  fastify.addHook('onResponse', async (request, reply) => {
    const log = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      status: reply.statusCode,
      ip: request.ip,
      userAgent: request.headers['user-agent'] || 'unknown',
      apiKey: request.headers['x-api-key'] || 'none'
    };
    
    // Save log asynchronously
    const logFile = path.join(logDir, `access-${new Date().toISOString().split('T')[0]}.log`);
    fs.appendFile(logFile, JSON.stringify(log) + '\n').catch(() => {});
    
    // Track rate limiting
    if (request.user) {
      // In production, use Redis for rate limiting
      console.log(`[${log.timestamp}] ${log.method} ${log.url} - ${log.status} (${request.user.plan})`);
    }
  });
}

// ✅ تغییر در این خط - فقط خود تابع رو export کنید
module.exports = trackingMiddleware;
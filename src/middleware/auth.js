// src/middleware/auth.js
const API_KEYS = {
  'free-key-123': { plan: 'free', limit: 50 },
  'pro-key-456': { plan: 'pro', limit: 200 },
  'enterprise-key-789': { plan: 'enterprise', limit: 1000 }
};

// ✅ این تابع رو به شکل استاندارد export کنید
function authMiddleware(fastify) {
  fastify.decorate('authenticate', async (request, reply) => {
    const apiKey = request.headers['x-api-key'];
    
    if (!apiKey) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'X-API-Key header is required'
      });
    }

    const keyData = API_KEYS[apiKey];
    if (!keyData) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Invalid API key'
      });
    }

    request.user = keyData;
  });

  // Apply auth to all routes except root
  fastify.addHook('preHandler', (request, reply, done) => {
    if (request.url === '/') {
      return done();
    }
    fastify.authenticate(request, reply, done);
  });
}

// ✅ Export به این شکل
module.exports = authMiddleware; // فقط خود تابع رو export کنید
// و اگر نیاز به API_KEYS هم دارید:
// module.exports = { authMiddleware, API_KEYS };
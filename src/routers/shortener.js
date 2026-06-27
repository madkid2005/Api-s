const shortenerService = require('../services/shortenerService');

async function routes(fastify, options) {
  // Create short link
  fastify.post('/create', async (request, reply) => {
    try {
      const { url, customCode } = request.body;
      
      if (!url) {
        return reply.status(400).send({ error: 'URL is required' });
      }
      
      const result = await shortenerService.createShortLink(url, customCode);
      return {
        success: true,
        ...result,
        shortUrl: `${request.protocol}://${request.hostname}/${result.code}`
      };
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Get stats
  fastify.get('/stats/:code', async (request, reply) => {
    try {
      const { code } = request.params;
      const stats = await shortenerService.getStats(code);
      return stats;
    } catch (error) {
      return reply.status(404).send({ error: error.message });
    }
  });

  // Redirect
  fastify.get('/:code', async (request, reply) => {
    try {
      const { code } = request.params;
      const url = await shortenerService.getRedirect(code);
      
      // Track click asynchronously
      const ip = request.ip;
      const userAgent = request.headers['user-agent'];
      const referer = request.headers['referer'];
      
      setImmediate(() => {
        shortenerService.trackClick(code, ip, userAgent, referer).catch(console.error);
      });
      
      return reply.redirect(302, url);
    } catch (error) {
      return reply.status(404).send({ error: error.message });
    }
  });
}

module.exports = routes;
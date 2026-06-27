const screenshotService = require('../services/screenshotService');

async function routes(fastify, options) {
  // Full page screenshot
  fastify.post('/fullpage', async (request, reply) => {
    try {
      const { url, options = {} } = request.body;
      
      if (!url) {
        return reply.status(400).send({ error: 'URL is required' });
      }
      
      const result = await screenshotService.captureFullPage(url, options);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Element screenshot
  fastify.post('/element', async (request, reply) => {
    try {
      const { url, selector, options = {} } = request.body;
      
      if (!url || !selector) {
        return reply.status(400).send({ error: 'URL and selector are required' });
      }
      
      const result = await screenshotService.captureElement(url, selector, options);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Simple capture (screenshot with base64)
  fastify.post('/capture', async (request, reply) => {
    try {
      const { url, fullPage = true } = request.body;
      
      if (!url) {
        return reply.status(400).send({ error: 'URL is required' });
      }
      
      const result = await screenshotService.captureFullPage(url, { fullPage });
      return {
        success: true,
        ...result
      };
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });
}

module.exports = routes;
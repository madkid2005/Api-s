const domainService = require('../services/domainService');

async function routes(fastify, options) {
  // Check domain availability
  fastify.post('/check', async (request, reply) => {
    try {
      const { domain } = request.body;
      
      if (!domain) {
        return reply.status(400).send({ error: 'Domain is required' });
      }
      
      const result = await domainService.checkAvailability(domain);
      return result;
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Get WHOIS info
  fastify.post('/whois', async (request, reply) => {
    try {
      const { domain } = request.body;
      
      if (!domain) {
        return reply.status(400).send({ error: 'Domain is required' });
      }
      
      const result = await domainService.getWhois(domain);
      return result;
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Get domain suggestions
  fastify.get('/suggestions/:name', async (request, reply) => {
    try {
      const { name } = request.params;
      
      if (!name) {
        return reply.status(400).send({ error: 'Domain name is required' });
      }
      
      const suggestions = await domainService.getSuggestions(name);
      return {
        name,
        suggestions
      };
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });
}

module.exports = routes;
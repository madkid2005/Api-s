const newsService = require('../services/newsService');

async function routes(fastify, options) {
  // Fetch news by category
  fastify.get('/fetch', async (request, reply) => {
    try {
      const { category = 'tech', limit = 10 } = request.query;
      
      const result = await newsService.fetchNews(category, parseInt(limit));
      return result;
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Search news
  fastify.get('/search', async (request, reply) => {
    try {
      const { keyword, limit = 10 } = request.query;
      
      if (!keyword) {
        return reply.status(400).send({ error: 'Keyword is required' });
      }
      
      const result = await newsService.searchNews(keyword, parseInt(limit));
      return result;
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Get categories
  fastify.get('/categories', async (request, reply) => {
    try {
      const categories = newsService.getCategories();
      return { categories };
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });
}

module.exports = routes;
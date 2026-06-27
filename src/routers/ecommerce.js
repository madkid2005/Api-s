const ecommerceService = require('../services/ecommerceService');

async function routes(fastify, options) {
  // Get products with filters
  fastify.get('/products', async (request, reply) => {
    try {
      const { category, brand, minPrice, maxPrice, sort, limit, page } = request.query;
      
      const filters = { category, brand, minPrice, maxPrice, sort, limit, page };
      const result = await ecommerceService.getProducts(filters);
      return result;
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Get single product
  fastify.get('/product/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const product = await ecommerceService.getProduct(id);
      return product;
    } catch (error) {
      return reply.status(404).send({ error: error.message });
    }
  });

  // Search products
  fastify.get('/search', async (request, reply) => {
    try {
      const { q } = request.query;
      
      if (!q) {
        return reply.status(400).send({ error: 'Search query is required' });
      }
      
      const result = await ecommerceService.searchProducts(q);
      return result;
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });
}

module.exports = routes;
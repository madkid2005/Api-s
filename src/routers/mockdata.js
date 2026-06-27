const mockService = require('../services/mockService');

async function routes(fastify, options) {
  // Generate mock users
  fastify.get('/users', async (request, reply) => {
    try {
      const { count = 10 } = request.query;
      const users = mockService.generateUsers(parseInt(count));
      return {
        success: true,
        count: users.length,
        data: users
      };
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Generate mock products
  fastify.get('/products', async (request, reply) => {
    try {
      const { count = 10 } = request.query;
      const products = mockService.generateProducts(parseInt(count));
      return {
        success: true,
        count: products.length,
        data: products
      };
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Generate mock orders
  fastify.get('/orders', async (request, reply) => {
    try {
      const { count = 10, users } = request.query;
      const orders = mockService.generateOrders(parseInt(count), users ? JSON.parse(users) : null);
      return {
        success: true,
        count: orders.length,
        data: orders
      };
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Generate custom mock data
  fastify.post('/custom', async (request, reply) => {
    try {
      const { schema, count = 1 } = request.body;
      
      if (!schema) {
        return reply.status(400).send({ error: 'Schema is required' });
      }
      
      const data = mockService.generateCustom(schema, parseInt(count));
      return {
        success: true,
        count: data.length,
        data
      };
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });
}

module.exports = routes;
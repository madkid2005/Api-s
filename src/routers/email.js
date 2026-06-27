const emailService = require('../services/emailService');

async function routes(fastify, options) {
  // Validate single email
  fastify.post('/validate', async (request, reply) => {
    try {
      const { email } = request.body;
      
      if (!email) {
        return reply.status(400).send({ error: 'Email is required' });
      }
      
      const result = await emailService.validateEmail(email);
      return result;
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Validate multiple emails
  fastify.post('/batch', async (request, reply) => {
    try {
      const { emails } = request.body;
      
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return reply.status(400).send({ 
          error: 'Array of emails is required' 
        });
      }
      
      if (emails.length > 100) {
        return reply.status(400).send({ 
          error: 'Maximum 100 emails per batch' 
        });
      }
      
      const results = await emailService.validateBatch(emails);
      return {
        total: results.length,
        valid: results.filter(r => r.valid).length,
        invalid: results.filter(r => !r.valid).length,
        results
      };
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Quick format validation only
  fastify.post('/validate/format', async (request, reply) => {
    try {
      const { email } = request.body;
      
      if (!email) {
        return reply.status(400).send({ error: 'Email is required' });
      }
      
      const result = emailService.validateFormat(email);
      return result;
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });
}

module.exports = routes;
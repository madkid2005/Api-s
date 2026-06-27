async function passwordEasyRoutes(fastify, options) {
  
  fastify.post('/password/easy', {
    schema: {
      summary: 'ساخت رمز ساده',
      description: 'فقط حروف کوچک انگلیسی + اعداد | هزینه: 1 واحد',
      tags: ['Password Generator - Easy'],
      body: {
        type: 'object',
        properties: {
          length: { type: 'number', default: 8, minimum: 4, maximum: 16 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            password: { type: 'string' },
            length: { type: 'number' },
            cost: { type: 'number' }
          }
        }
      },
      headers: {
        type: 'object',
        required: ['x-api-key'],
        properties: {
          'x-api-key': { type: 'string' }
        }
      }
    },
    preHandler: [fastify.verifyApiKey]
  }, async (request, reply) => {
    
    // هزینه 1 واحد
    const totalUsage = await fastify.trackUsage(request, reply, 1);
    
    const { length = 8 } = request.body;
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return {
      password,
      length: password.length,
      cost: 1,
      totalUsage
    };
  });
}

module.exports = passwordEasyRoutes;
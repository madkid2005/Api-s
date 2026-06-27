async function passwordMediumRoutes(fastify, options) {
  
  fastify.post('/password/medium', {
    schema: {
      summary: 'ساخت رمز متوسط',
      description: 'حروف بزرگ + کوچک + اعداد + نمادها | هزینه: 3 واحد',
      tags: ['Password Generator - Medium'],
      body: {
        type: 'object',
        properties: {
          length: { type: 'number', default: 12, minimum: 8, maximum: 24 },
          excludeSimilar: { type: 'boolean', default: false }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            password: { type: 'string' },
            length: { type: 'number' },
            strength: { type: 'string' },
            entropy: { type: 'number' },
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
    
    // هزینه 3 واحد
    const totalUsage = await fastify.trackUsage(request, reply, 3);
    
    let { length = 12, excludeSimilar = false } = request.body;
    
    let lower = 'abcdefghijkmnopqrstuvwxyz';
    let upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let numbers = '23456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (!excludeSimilar) {
      lower = 'abcdefghijklmnopqrstuvwxyz';
      upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      numbers = '0123456789';
    }
    
    const allChars = lower + upper + numbers + symbols;
    
    let password = '';
    password += lower[Math.floor(Math.random() * lower.length)];
    password += upper[Math.floor(Math.random() * upper.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    const poolSize = allChars.length;
    const entropy = Math.log2(Math.pow(poolSize, length));
    
    let strength = 'weak';
    if (entropy >= 60 && entropy < 80) strength = 'medium';
    if (entropy >= 80) strength = 'strong';
    
    return {
      password,
      length: password.length,
      strength,
      entropy: Math.round(entropy),
      cost: 3,
      totalUsage
    };
  });
}

module.exports = passwordMediumRoutes;
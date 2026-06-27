const crypto = require('crypto');

// ذخیره تاریخچه رمزها (در تولید از Redis استفاده کن)
const passwordHistory = new Map();

async function passwordHardRoutes(fastify, options) {
  
  fastify.post('/password/hard', {
    schema: {
      summary: 'ساخت رمز سخت',
      description: 'رمز فوق‌امن با رمزنگاری پیشرفته + قابلیت پیگیری | هزینه: 10 واحد',
      tags: ['Password Generator - Hard'],
      body: {
        type: 'object',
        properties: {
          length: { type: 'number', default: 16, minimum: 12, maximum: 64 },
          useCryptoRandom: { type: 'boolean', default: true },
          returnHash: { type: 'boolean', default: false },
          userId: { type: 'string', default: 'anonymous' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            password: { type: 'string' },
            hash: { type: 'string' },
            length: { type: 'number' },
            entropy: { type: 'number' },
            requestId: { type: 'string' },
            timestamp: { type: 'string' },
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
    
    // هزینه 10 واحد
    const totalUsage = await fastify.trackUsage(request, reply, 10);
    
    let { length = 16, useCryptoRandom = true, returnHash = false, userId = 'anonymous' } = request.body;
    
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?~`';
    const allChars = upper + lower + numbers + symbols;
    
    let password = '';
    
    if (useCryptoRandom) {
      const bytes = crypto.randomBytes(length);
      for (let i = 0; i < length; i++) {
        password += allChars[bytes[i] % allChars.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
      }
    }
    
    const poolSize = allChars.length;
    const entropy = Math.log2(Math.pow(poolSize, length));
    const requestId = crypto.randomBytes(8).toString('hex');
    const timestamp = new Date().toISOString();
    
    // ذخیره در تاریخچه
    const historyKey = `${userId}:${request.apiKey}`;
    if (!passwordHistory.has(historyKey)) {
      passwordHistory.set(historyKey, []);
    }
    
    passwordHistory.get(historyKey).push({
      requestId,
      password: returnHash ? null : password,
      hash: returnHash ? crypto.createHash('sha256').update(password).digest('hex') : null,
      timestamp,
      length,
      userId
    });
    
    if (passwordHistory.get(historyKey).length > 50) {
      passwordHistory.get(historyKey).shift();
    }
    
    const response = {
      length: password.length,
      entropy: Math.round(entropy),
      requestId,
      timestamp,
      cost: 10,
      totalUsage
    };
    
    if (returnHash) {
      response.hash = crypto.createHash('sha256').update(password).digest('hex');
      response.message = 'Original password not returned for security';
    } else {
      response.password = password;
    }
    
    return response;
  });
  
  // روت پیگیری تاریخچه (رایگان)
  fastify.get('/password/hard/history', {
    schema: {
      summary: 'مشاهده تاریخچه رمزها',
      description: 'رایگان - برای پیگیری رمزهای ساخته شده قبلی',
      tags: ['Password Generator - Hard'],
      querystring: {
        type: 'object',
        properties: {
          userId: { type: 'string', default: 'anonymous' },
          limit: { type: 'number', default: 10, maximum: 50 }
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
    
    const { userId = 'anonymous', limit = 10 } = request.query;
    const historyKey = `${userId}:${request.apiKey}`;
    
    const history = passwordHistory.get(historyKey) || [];
    const lastEntries = history.slice(-limit);
    
    return {
      total: history.length,
      history: lastEntries.map(entry => ({
        requestId: entry.requestId,
        timestamp: entry.timestamp,
        length: entry.length,
        hasHash: !!entry.hash
      }))
    };
  });
}

module.exports = passwordHardRoutes;
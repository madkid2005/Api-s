const fastify = require('fastify')({
  logger: true,
  trustProxy: true
});

// ========== ایمپورت پلاگین‌ها ==========
const cors = require('@fastify/cors');
const rateLimit = require('@fastify/rate-limit');

// ========== ایمپورت میدلورها ==========
// ✅ حالا authMiddleware یک تابع هست
const authMiddleware = require('./src/middleware/auth');
const trackingMiddleware = require('./src/middleware/tracking');

// ========== تنظیمات CORS ==========
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

// ========== Rate Limiting ==========
fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// ========== ثبت میدلورها ==========
// ✅ حالا authMiddleware یک تابع معتبر هست
fastify.register(function(fastify, options, done) {
  authMiddleware(fastify);
  done();
});

fastify.register(function(fastify, options, done) {
  trackingMiddleware(fastify);
  done();
});

// ========== ثبت روت‌های سرویس‌ها ==========
const routers = [
  { path: './src/routers/shortener', prefix: '/shortener' },
  { path: './src/routers/screenshot', prefix: '/screenshot' },
  { path: './src/routers/qrcode', prefix: '/qrcode' },
  { path: './src/routers/domain', prefix: '/domain' },
  { path: './src/routers/news', prefix: '/news' },
  { path: './src/routers/ecommerce', prefix: '/ecommerce' },
  { path: './src/routers/mockdata', prefix: '/mock' },
  { path: './src/routers/monitor', prefix: '/monitor' },
  { path: './src/routers/email', prefix: '/email' }
];

routers.forEach(({ path, prefix }) => {
  try {
    const router = require(path);
    if (typeof router === 'function') {
      fastify.register(router, { prefix });
      console.log(`✅ Registered ${prefix}`);
    } else if (router && typeof router === 'object') {
      if (router.plugin && typeof router.plugin === 'function') {
        fastify.register(router.plugin, { prefix });
        console.log(`✅ Registered ${prefix} (as plugin)`);
      } else {
        console.log(`⚠️  Router ${path} is an object, trying to convert...`);
        fastify.register(async function(fastify, options) {
          if (typeof router.routes === 'function') {
            router.routes(fastify);
          } else {
            Object.keys(router).forEach(key => {
              if (typeof router[key] === 'function') {
                fastify.route({
                  method: key.toUpperCase(),
                  url: '/',
                  handler: router[key]
                });
              }
            });
          }
        }, { prefix });
        console.log(`✅ Registered ${prefix} (as object)`);
      }
    } else {
      console.error(`❌ Invalid router: ${path} (type: ${typeof router})`);
    }
  } catch (err) {
    console.error(`❌ Error loading router ${path}:`, err.message);
  }
});

// ========== روت خوش‌آمدگویی ==========
fastify.get('/', async (request, reply) => {
  return {
    name: 'API Frooshi',
    version: '2.0.0',
    services: {
      shortener: {
        create: 'POST /shortener/create',
        stats: 'GET /shortener/stats/:code',
        redirect: 'GET /shortener/:code'
      },
      screenshot: {
        capture: 'POST /screenshot/capture',
        fullPage: 'POST /screenshot/fullpage',
        element: 'POST /screenshot/element'
      },
      qrcode: {
        generate: 'POST /qrcode/generate',
        decode: 'POST /qrcode/decode',
        barcode: 'POST /qrcode/barcode'
      },
      domain: {
        check: 'POST /domain/check',
        whois: 'POST /domain/whois',
        suggestions: 'GET /domain/suggestions/:name'
      },
      news: {
        fetch: 'GET /news/fetch',
        search: 'GET /news/search',
        categories: 'GET /news/categories'
      },
      ecommerce: {
        products: 'GET /ecommerce/products',
        product: 'GET /ecommerce/product/:id',
        search: 'GET /ecommerce/search'
      },
      mock: {
        users: 'GET /mock/users',
        products: 'GET /mock/products',
        orders: 'GET /mock/orders',
        custom: 'POST /mock/custom'
      },
      monitor: {
        add: 'POST /monitor/add',
        status: 'GET /monitor/status/:id',
        alerts: 'GET /monitor/alerts'
      },
      email: {
        validate: 'POST /email/validate',
        batch: 'POST /email/batch'
      }
    },
    auth: 'Header: X-API-Key',
    rateLimit: '100 requests per minute'
  };
});

// ========== شروع سرور ==========
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    console.log('\n🚀 Server is running!');
    console.log(`📍 URL: http://localhost:${process.env.PORT || 3000}`);
    console.log('\n📋 Available API Keys:');
    console.log('   free-key-123      (plan: free - 50 req/min)');
    console.log('   pro-key-456       (plan: pro - 200 req/min)');
    console.log('   enterprise-key-789 (plan: enterprise - 1000 req/min)');
    console.log('\n📚 Documentation: http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
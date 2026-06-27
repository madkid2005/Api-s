// src/routers/monitor.js
const monitors = new Map();
let alertId = 1;

async function monitorRoutes(fastify, options) {
  
  // Add monitor
  fastify.post('/add', async (request, reply) => {
    try {
      const { url, name, interval } = request.body;
      
      if (!url) {
        return reply.status(400).send({
          success: false,
          error: 'URL is required'
        });
      }
      
      const id = Date.now().toString();
      const monitor = {
        id,
        url,
        name: name || url,
        interval: interval || 60,
        status: 'active',
        createdAt: new Date().toISOString(),
        checks: 0,
        uptime: '100%'
      };
      
      monitors.set(id, monitor);
      
      return {
        success: true,
        ...monitor,
        message: 'Monitor added successfully'
      };
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });

  // Get monitor status
  fastify.get('/status/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const monitor = monitors.get(id);
      
      if (!monitor) {
        return reply.status(404).send({
          success: false,
          error: 'Monitor not found'
        });
      }
      
      return {
        success: true,
        ...monitor,
        lastCheck: new Date().toISOString(),
        responseTime: Math.floor(Math.random() * 200) + 50,
        statusCode: 200
      };
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });

  // Get all alerts
  fastify.get('/alerts', async (request, reply) => {
    try {
      const alerts = [
        {
          id: alertId++,
          monitorId: '1',
          message: 'High response time detected',
          severity: 'warning',
          timestamp: new Date().toISOString()
        },
        {
          id: alertId++,
          monitorId: '2',
          message: 'Service is down',
          severity: 'critical',
          timestamp: new Date().toISOString()
        }
      ];
      
      return {
        success: true,
        alerts,
        count: alerts.length
      };
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });

  // List all monitors
  fastify.get('/list', async (request, reply) => {
    try {
      const allMonitors = Array.from(monitors.values());
      return {
        success: true,
        count: allMonitors.length,
        monitors: allMonitors
      };
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });

  // Remove monitor
  fastify.delete('/remove/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const deleted = monitors.delete(id);
      
      if (!deleted) {
        return reply.status(404).send({
          success: false,
          error: 'Monitor not found'
        });
      }
      
      return {
        success: true,
        message: 'Monitor removed successfully'
      };
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error.message
      });
    }
  });
}

module.exports = monitorRoutes;
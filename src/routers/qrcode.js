const qrService = require('../services/qrService');
const fs = require('fs').promises;

async function routes(fastify, options) {
  // Generate QR Code
  fastify.post('/generate', async (request, reply) => {
    try {
      const { data, options = {} } = request.body;
      
      if (!data) {
        return reply.status(400).send({ error: 'Data is required' });
      }
      
      const result = await qrService.generateQR(data, options);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Generate Barcode
  fastify.post('/barcode', async (request, reply) => {
    try {
      const { data, options = {} } = request.body;
      
      if (!data) {
        return reply.status(400).send({ error: 'Data is required' });
      }
      
      const result = await qrService.generateBarcode(data, options);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Decode QR Code (upload image)
  fastify.post('/decode', async (request, reply) => {
    try {
      const { imagePath } = request.body;
      
      if (!imagePath) {
        return reply.status(400).send({ error: 'Image path is required' });
      }
      
      const result = await qrService.decodeQR(imagePath);
      return {
        success: true,
        ...result
      };
    } catch (error) {
      return reply.status(400).send({ error: error.message });
    }
  });

  // Serve QR code image
  fastify.get('/:filename', async (request, reply) => {
    try {
      const { filename } = request.params;
      const filePath = `${qrService.qrDir}/${filename}`;
      
      try {
        await fs.access(filePath);
        return reply.sendFile(filename, qrService.qrDir);
      } catch {
        return reply.status(404).send({ error: 'File not found' });
      }
    } catch (error) {
      return reply.status(404).send({ error: error.message });
    }
  });
}

module.exports = routes;
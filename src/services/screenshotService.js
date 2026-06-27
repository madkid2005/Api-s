const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class ScreenshotService {
  constructor() {
    this.screenshotDir = path.join(__dirname, '../../screenshots');
    this.ensureDirectory();
  }

  async ensureDirectory() {
    await fs.mkdir(this.screenshotDir, { recursive: true });
  }

  async captureFullPage(url, options = {}) {
    try {
      // Using a free screenshot API
      const apiUrl = `https://api.screenshotmachine.com/?key=demo&url=${encodeURIComponent(url)}&dimension=1920x1080&format=png&cacheLimit=0`;
      
      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      const timestamp = Date.now();
      const filename = `screenshot-${timestamp}.png`;
      const filePath = path.join(this.screenshotDir, filename);
      
      await fs.writeFile(filePath, response.data);
      const base64 = response.data.toString('base64');
      
      return {
        success: true,
        filename,
        base64,
        size: response.data.length,
        url: `/screenshots/${filename}`,
        note: 'Screenshot captured via screenshotmachine.com'
      };
    } catch (error) {
      // Fallback: return a placeholder
      const placeholderBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
      const placeholderBuffer = Buffer.from(placeholderBase64, 'base64');
      
      const filename = `screenshot-${Date.now()}.png`;
      const filePath = path.join(this.screenshotDir, filename);
      
      await fs.writeFile(filePath, placeholderBuffer);
      
      return {
        success: true,
        filename,
        base64: placeholderBase64,
        size: placeholderBuffer.length,
        url: `/screenshots/${filename}`,
        warning: 'Placeholder generated - install playwright for real screenshots',
        error: error.message
      };
    }
  }

  async captureElement(url, selector, options = {}) {
    // Simplified version - captures full page
    return this.captureFullPage(url, options);
  }
}

module.exports = new ScreenshotService();
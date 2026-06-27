const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');

class QRService {
  constructor() {
    this.qrDir = path.join(__dirname, '../../qrcodes');
    this.ensureDirectory();
  }

  async ensureDirectory() {
    await fs.mkdir(this.qrDir, { recursive: true });
  }

  async generateQR(data, options = {}) {
    const filename = `qr-${Date.now()}.png`;
    const filePath = path.join(this.qrDir, filename);
    
    const qrOptions = {
      errorCorrectionLevel: options.errorCorrectionLevel || 'H',
      type: 'png',
      quality: 0.92,
      margin: options.margin || 4,
      color: {
        dark: options.color || '#000000',
        light: options.bgColor || '#FFFFFF'
      },
      width: options.width || 400
    };
    
    await QRCode.toFile(filePath, data, qrOptions);
    
    const imageBuffer = await fs.readFile(filePath);
    const base64 = imageBuffer.toString('base64');
    
    return {
      success: true,
      filename,
      base64,
      size: imageBuffer.length,
      url: `/qrcodes/${filename}`,
      data: data
    };
  }

  async generateBarcode(data, options = {}) {
    // Generate a simple text-based barcode
    const filename = `barcode-${Date.now()}.txt`;
    const filePath = path.join(this.qrDir, filename);
    
    // Create a simple ASCII barcode
    const barcodeText = this.generateAsciiBarcode(data);
    await fs.writeFile(filePath, barcodeText);
    
    const textBuffer = await fs.readFile(filePath);
    const base64 = Buffer.from(barcodeText).toString('base64');
    
    return {
      success: true,
      filename,
      base64,
      size: textBuffer.length,
      url: `/qrcodes/${filename}`,
      data: data,
      format: 'ascii'
    };
  }

  generateAsciiBarcode(data) {
    const chars = data.split('');
    let result = '╔═══════════════════════════════════════╗\n';
    result += '║                                       ║\n';
    result += '║          ASCII BARCODE               ║\n';
    result += '║                                       ║\n';
    result += '║  ';
    
    for (const char of chars) {
      const code = char.charCodeAt(0);
      const pattern = code % 2 === 0 ? '█' : '░';
      result += pattern.repeat(2);
    }
    
    result += '  ║\n';
    result += '║                                       ║\n';
    result += '║    Data: ' + data.padEnd(30) + '║\n';
    result += '║                                       ║\n';
    result += '╚═══════════════════════════════════════╝';
    
    return result;
  }

  async decodeQR(imagePath) {
    // Placeholder for QR decoding
    return {
      success: true,
      data: 'https://example.com/decoded-data',
      note: 'QR decoding requires additional setup'
    };
  }
}

module.exports = new QRService();
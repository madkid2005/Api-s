// src/services/qrService.js
const QRCode = require('qrcode');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class QRService {
  constructor() {
    this.qrDir = path.join(__dirname, '../../uploads/qr-codes');
    this.barcodeDir = path.join(__dirname, '../../uploads/barcodes');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.qrDir, { recursive: true });
      await fs.mkdir(this.barcodeDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  async generateQR(data, options = {}) {
    try {
      const filename = `qr-${uuidv4()}.png`;
      const filePath = path.join(this.qrDir, filename);
      
      const qrOptions = {
        type: 'png',
        width: options.width || 300,
        margin: options.margin || 2,
        color: {
          dark: options.color || '#000000',
          light: options.backgroundColor || '#ffffff'
        },
        ...options
      };

      await QRCode.toFile(filePath, data, qrOptions);
      
      return {
        filename,
        url: `/qrcode/${filename}`,
        data,
        format: 'png',
        size: qrOptions.width
      };
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  async generateBarcode(data, options = {}) {
    try {
      const filename = `barcode-${uuidv4()}.png`;
      const filePath = path.join(this.barcodeDir, filename);
      
      const canvas = createCanvas(400, 200);
      const ctx = canvas.getContext('2d');
      
      JsBarcode(canvas, data, {
        format: options.format || 'CODE128',
        width: options.width || 2,
        height: options.height || 100,
        displayValue: options.displayValue !== false,
        font: 'monospace',
        fontSize: options.fontSize || 20,
        ...options
      });
      
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(filePath, buffer);
      
      return {
        filename,
        url: `/barcode/${filename}`,
        data,
        format: 'png'
      };
    } catch (error) {
      throw new Error(`Failed to generate barcode: ${error.message}`);
    }
  }

  async decodeQR(imagePath) {
    try {
      return {
        text: 'Sample decoded text from QR code',
        data: imagePath,
        format: 'qr'
      };
    } catch (error) {
      throw new Error(`Failed to decode QR: ${error.message}`);
    }
  }
}

// ✅ اصلاح این خط - export کردن کلاس
module.exports = new QRService();
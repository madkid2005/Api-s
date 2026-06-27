const { nanoid } = require('nanoid');
const fs = require('fs').promises;
const path = require('path');

class ShortenerService {
  constructor() {
    this.dbPath = path.join(__dirname, '../../data/shortener.json');
    this.ensureDataFile();
  }

  async ensureDataFile() {
    try {
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      await fs.access(this.dbPath);
    } catch {
      await fs.writeFile(this.dbPath, JSON.stringify({}));
    }
  }

  async readDB() {
    const data = await fs.readFile(this.dbPath, 'utf8');
    return JSON.parse(data);
  }

  async writeDB(data) {
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
  }

  async createShortLink(url, customCode = null) {
    const db = await this.readDB();
    let code = customCode || nanoid(8);
    
    // Check if code exists
    if (db[code]) {
      if (customCode) {
        throw new Error('Custom code already exists');
      }
      code = nanoid(10); // Generate new code
    }

    const entry = {
      url,
      code,
      created: new Date().toISOString(),
      clicks: 0,
      referrers: {},
      countries: {}
    };

    db[code] = entry;
    await this.writeDB(db);
    return entry;
  }

  async getStats(code) {
    const db = await this.readDB();
    if (!db[code]) {
      throw new Error('Short link not found');
    }
    return db[code];
  }

  async trackClick(code, ip, userAgent, referer) {
    const db = await this.readDB();
    if (!db[code]) {
      throw new Error('Short link not found');
    }
    
    db[code].clicks++;
    db[code].referrers[referer || 'direct'] = (db[code].referrers[referer || 'direct'] || 0) + 1;
    
    // Simple country detection (in production use geolocation)
    const country = 'Unknown';
    db[code].countries[country] = (db[code].countries[country] || 0) + 1;
    
    await this.writeDB(db);
    return db[code];
  }

  async getRedirect(code) {
    const db = await this.readDB();
    if (!db[code]) {
      throw new Error('Short link not found');
    }
    return db[code].url;
  }
}

module.exports = new ShortenerService();
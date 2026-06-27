
const whois = require('whois');
const dns = require('dns');
const { promisify } = require('util');
const axios = require('axios');

const dnsLookup = promisify(dns.lookup);

class DomainService {
  async checkAvailability(domain) {
    try {
      await dnsLookup(domain);
      return { domain, available: false, message: 'Domain is taken' };
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        return { domain, available: true, message: 'Domain is available' };
      }
      throw error;
    }
  }

  async getWhois(domain) {
    return new Promise((resolve, reject) => {
      whois.lookup(domain, (err, data) => {
        if (err) {
          reject(err);
        } else {
          // Parse WHOIS data
          const parsed = this.parseWhoisData(data);
          resolve(parsed);
        }
      });
    });
  }

  parseWhoisData(data) {
    const lines = data.split('\n');
    const info = {};
    
    const patterns = {
      registrar: /Registrar:\s*(.+)/i,
      creationDate: /Creation Date:\s*(.+)/i,
      expiryDate: /Registry Expiry Date:\s*(.+)/i,
      updatedDate: /Updated Date:\s*(.+)/i,
      nameServers: /Name Server:\s*(.+)/i,
      status: /Status:\s*(.+)/i,
      domain: /Domain Name:\s*(.+)/i
    };

    for (const line of lines) {
      for (const [key, pattern] of Object.entries(patterns)) {
        const match = line.match(pattern);
        if (match) {
          if (key === 'nameServers') {
            if (!info.nameServers) info.nameServers = [];
            info.nameServers.push(match[1].trim());
          } else {
            info[key] = match[1].trim();
          }
        }
      }
    }
    
    return info;
  }

  async getSuggestions(name) {
    const suggestions = [];
    const tlds = ['.com', '.net', '.org', '.io', '.co', '.dev', '.app'];
    
    for (const tld of tlds) {
      const domain = name + tld;
      try {
        await dnsLookup(domain);
        suggestions.push({ domain, available: false });
      } catch {
        suggestions.push({ domain, available: true });
      }
    }
    
    return suggestions;
  }
}

module.exports = new DomainService();
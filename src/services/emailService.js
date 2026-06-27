const dns = require('dns');
const { promisify } = require('util');

const dnsResolveMx = promisify(dns.resolveMx);
const dnsResolveTxt = promisify(dns.resolveTxt);

class EmailService {
  constructor() {
    this.disposableDomains = [
      'mailinator.com', 'guerrillamail.com', 'tempmail.com',
      'throwaway.com', 'fakeinbox.com', '10minutemail.com'
    ];
  }

  async validateEmail(email) {
    const validation = {
      email,
      valid: false,
      errors: [],
      warnings: []
    };
    
    // Basic format validation
    if (!email || !email.includes('@')) {
      validation.errors.push('Invalid email format');
      return validation;
    }
    
    const [localPart, domain] = email.split('@');
    
    // Check local part
    if (localPart.length === 0 || localPart.length > 64) {
      validation.errors.push('Invalid local part length');
    }
    
    // Check domain
    if (domain.length === 0 || domain.length > 255) {
      validation.errors.push('Invalid domain length');
    }
    
    if (this.isDisposable(domain)) {
      validation.warnings.push('Disposable email domain detected');
    }
    
    // MX record validation
    try {
      const mxRecords = await dnsResolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        validation.valid = true;
        validation.mxRecords = mxRecords;
      } else {
        validation.errors.push('No MX records found for domain');
      }
    } catch (error) {
      validation.errors.push('Domain does not exist or no MX records');
    }
    
    return validation;
  }

  async validateBatch(emails) {
    const results = [];
    for (const email of emails) {
      const result = await this.validateEmail(email);
      results.push(result);
    }
    return results;
  }

  isDisposable(domain) {
    return this.disposableDomains.some(d => domain.toLowerCase().includes(d));
  }

  // Syntactic validation only (quick check)
  validateFormat(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return {
      email,
      valid: regex.test(email),
      message: regex.test(email) ? 'Valid format' : 'Invalid format'
    };
  }
}

module.exports = new EmailService();
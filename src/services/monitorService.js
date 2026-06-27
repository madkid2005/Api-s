const axios = require('axios');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

class MonitorService {
  constructor() {
    this.monitors = [];
    this.alerts = [];
    this.dbPath = path.join(__dirname, '../../data/monitors.json');
    this.ensureDataFile();
    this.startMonitoring();
  }

  async ensureDataFile() {
    try {
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      const data = await fs.readFile(this.dbPath, 'utf8');
      this.monitors = JSON.parse(data);
    } catch {
      await fs.writeFile(this.dbPath, JSON.stringify([]));
    }
  }

  async saveMonitors() {
    await fs.writeFile(this.dbPath, JSON.stringify(this.monitors, null, 2));
  }

  addMonitor(config) {
    const monitor = {
      id: Date.now().toString(),
      name: config.name,
      url: config.url,
      method: config.method || 'GET',
      interval: config.interval || 60, // seconds
      timeout: config.timeout || 5000,
      expectedStatus: config.expectedStatus || 200,
      expectedText: config.expectedText,
      alertEmails: config.alertEmails || [],
      webhook: config.webhook,
      status: 'pending',
      uptime: 0,
      downtime: 0,
      checks: 0,
      failures: 0,
      lastCheck: null,
      lastStatus: null,
      history: [],
      createdAt: new Date().toISOString()
    };
    
    this.monitors.push(monitor);
    this.saveMonitors();
    return monitor;
  }

  async checkMonitor(monitor) {
    const start = Date.now();
    let status = 'up';
    let error = null;
    let responseTime = 0;
    
    try {
      const response = await axios({
        method: monitor.method,
        url: monitor.url,
        timeout: monitor.timeout,
        validateStatus: false
      });
      
      responseTime = Date.now() - start;
      const statusOk = response.status === monitor.expectedStatus;
      
      if (statusOk) {
        if (monitor.expectedText) {
          const textFound = response.data.includes(monitor.expectedText);
          if (!textFound) {
            status = 'down';
            error = 'Expected text
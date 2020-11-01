const fs = require('fs');
const pino = require('pino');
const config = require('../config');

// log level: 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
const logger = pino(config.logger);

if (config.logsDirectory) {
  if (!fs.existsSync(config.logsDirectory)) {
    fs.mkdirSync(config.logsDirectory);
  }
  pino.destination(`${config.logsDirectory}/pig.log`);
}

module.exports = logger;

const pino = require('pino');
const config = require('../config');

// log level: 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
const logger = pino(config.logger);

module.exports = logger;

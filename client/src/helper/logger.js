const pino = require('pino');
const config = require('../config/index');

// log level: 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
const logger = pino({
  prettyPrint: { translateTime: 'SYS:standard' },
  level: config.logger.level,
});

if (config.logger.logsDirectory) {
  pino.destination(`${config.logger.logsDirectory}/pig.log`);
}

module.exports = logger;

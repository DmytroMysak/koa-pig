const pino = require('pino');
const config = require('../config/index');

// log level: 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
const logger = pino({
  prettyPrint: { translateTime: 'SYS:standard' },
  level: config.logger.level,
});

if (config.logsDirectory) {
  pino.destination(`${config.logsDirectory}/pig.log`);
}

module.exports = logger;

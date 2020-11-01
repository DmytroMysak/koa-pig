const path = require('path');

module.exports = {
  env: 'production',
  isProduction: true,
  logger: {
    level: 'debug',
    logsDirectory: path.normalize(`${__dirname}/../../logs`),
  },
};

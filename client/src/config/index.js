require('dotenv').config();

const development = require('./development');
const production = require('./production');

const env = process.env.NODE_ENV || 'development';
const config = { development, production };

const defaults = {
  logger: {
    prettyPrint: {
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
    level: 'debug',
  },
  amqp: {
    url: process.env.AMQP_URL,
    responseQueueName: 'response-queue',
    queueName: process.env.SECRET_KEY,
  },
};

module.exports = { ...defaults, ...(config[env] || config.development) };

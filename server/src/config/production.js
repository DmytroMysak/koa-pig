const path = require('path');

module.exports = {
  env: 'production',
  initializeVoice: true,
  logsDirectory: path.normalize(`${__dirname}/../../logs`),
  amqp: {
    url: process.env.AMQP_URL || process.env.CLOUDAMQP_URL,
    responseQueueName: 'response-queue',
  },
  mongoose: {
    debug: false,
    uri: process.env.MONGO_URL_PROD,
    options: {
      socketTimeoutMS: 0,
      keepAlive: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    },
  },
};

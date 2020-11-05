module.exports = {
  env: 'production',
  initializeVoice: true,
  amqp: {
    url: process.env.AMQP_URL || process.env.CLOUDAMQP_URL,
  },
  mongoose: {
    debug: false,
    uri: process.env.MONGO_URL,
  },
};

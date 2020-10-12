module.exports = {
  env: 'development',
  port: process.env.PORT || 5000,
  logger: {
    prettyPrint: { translateTime: 'SYS:standard' },
    level: 'debug',
  },
  createAppUrl: true,
  mongoose: {
    debug: true,
    uri: process.env.CPP_MONGO_URL || 'mongodb://localhost/littlePigBot',
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

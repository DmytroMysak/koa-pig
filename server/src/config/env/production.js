module.exports = {
  env: 'production',
  isProd: true,
  port: process.env.PORT || 8080,
  logger: {
    prettyPrint: false,
    level: 'info',
  },
  createAppUrl: true,
  mongoose: {
    debug: false,
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

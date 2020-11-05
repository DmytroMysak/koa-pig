module.exports = {
  env: 'development',
  mongoose: {
    debug: true,
    uri: process.env.MONGO_URL,
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

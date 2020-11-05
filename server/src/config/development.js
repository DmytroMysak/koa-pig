module.exports = {
  env: 'development',
  mongoose: {
    debug: true,
    uri: process.env.MONGO_URL || 'mongodb://localhost:27017/littlePigBot',
  },
};

export default {
  env: 'development',
  port: process.env.PORT || 5000,
  logger: {
    prettyPrint: { translateTime: 'SYS:standard' },
    level: 'debug',
  },
  createAppUrl: true,
};

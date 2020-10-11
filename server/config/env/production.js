export default {
  env: 'production',
  port: process.env.PORT || 8080,
  logger: {
    prettyPrint: false,
    level: 'info',
  },
  createAppUrl: true,
};

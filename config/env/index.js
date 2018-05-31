const env = process.env.NODE_ENV || 'development';
const config = require(`./${env}`); // eslint-disable-line import/no-dynamic-require

const defaults = {
  hostname: '0.0.0.0',
};

export default Object.assign(defaults, config.default);

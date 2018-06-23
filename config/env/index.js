require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const config = require(`./${env}`); // eslint-disable-line import/no-dynamic-require

const defaults = {
  pg: {

  },
  aws: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: 'eu-west-1',
  },
  folderToSaveSongs: 'songs',
};

export default Object.assign(defaults, config.default);

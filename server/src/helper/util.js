const crypto = require('crypto');
const config = require('../config');

const createHash = (x) => crypto.createHash('sha256').update(x, 'utf8').digest('hex');

const createFileName = (text, voiceId) => `${createHash(text)}-${voiceId}.${config.songFormat}`;

const createFileLink = (fileName) => `${config.bucket.url}/${config.bucket.name}/${fileName}`;

module.exports = {
  createFileName,
  createFileLink,
};

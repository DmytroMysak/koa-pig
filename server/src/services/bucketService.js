const { Storage } = require('@google-cloud/storage');
const config = require('../config/env/index');

const storage = new Storage();
const bucket = storage.bucket(config.bucket.name);

module.exports = {
  isExistFile: (name) => bucket.file(name).exists().then(([res]) => res),
  uploadFile: async (name, file) => {
    const bucketFile = bucket.file(name);
    await bucketFile.save(file.AudioStream, { metadata: { ContentType: file.ContentType } });
    await bucketFile.makePublic();
  },
};

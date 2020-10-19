const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const config = require('../config/env');

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const locales = new Map();

module.exports = {
  async initialize() {
    const fileNames = await readDir(config.localesPath);
    const files = fileNames
      .map((file) => path.parse(file))
      .filter((file) => file.ext === '.json')
      .map((file) => Promise.all([
        file.name,
        readFile(`${config.localesPath}/${file.base}`),
      ]));

    // eslint-disable-next-line no-restricted-syntax
    for await (const [name, file] of files) {
      locales.set(name, JSON.parse(file));
    }
  },

  translate: (label, currentLocale = config.defaultLocale) => locales.get(currentLocale)[label] || label,

  translateAll: (label) => [...locales.keys()].map((key) => locales.get(key)[label] || label),

  localeList: () => [...locales.keys()],
};

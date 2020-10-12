const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const config = require('../config/env');

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

module.exports = class I18nService {
  constructor() {
    if (typeof I18nService.instance === 'object') {
      return I18nService.instance;
    }
    I18nService.instance = this;
    this.locales = new Map();
    return this;
  }

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
      this.locales.set(name, JSON.parse(file));
    }
  }

  translate(label, currentLocale = config.defaultLocale) {
    return this.locales.get(currentLocale)[label] || label;
  }
};

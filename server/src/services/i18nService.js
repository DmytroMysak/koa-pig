import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import config from '../../config/env';

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

export default class I18nService {
  constructor() {
    this.locales = new Map();
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

  translate(label, currentLocale) {
    return this.locales.get(currentLocale)[label] || label;
  }
}

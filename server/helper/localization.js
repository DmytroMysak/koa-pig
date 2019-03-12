import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

export default class Localization {
  constructor() {
    this.locales = new Map();
  }

  async translate(label, currentLocale) {
    if (!this.locales.has(currentLocale)) {
      const pathToFile = path.normalize(`${__dirname}/../locales/${currentLocale}.json`);
      const readFile = promisify(fs.readFile);
      const locale = await readFile(pathToFile, 'utf-8');
      this.locales.set(currentLocale, JSON.parse(locale));
    }
    return this.locales.get(currentLocale)[label] || label;
  }
}

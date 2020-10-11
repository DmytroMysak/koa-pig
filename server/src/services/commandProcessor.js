import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readDir = promisify(fs.readdir);

export default class CommandProcessor {
  constructor() {
    if (typeof CommandProcessor.instance === 'object') {
      return CommandProcessor.instance;
    }
    CommandProcessor.instance = this;
    this.commands = [];
    return this;
  }

  addCommand(command) {
    this.commands.push(command);
  }

  getCommands() {
    return this.commands.map((command) => ({
      name: command.name,
      type: command.type,
      exec: command.execute,
    }));
  }

  initializeCommands() {
    const fileNames = readDir(path.normalize(`${__dirname}/commands`));

    const commands = fileNames
      .map((file) => path.parse(file))
      .filter((file) => file.ext === '.js' && file.name !== 'baseCommand')
      .sort()
      // callback_query, text, audio, voice, document, message
      // (a, b) {
      //   if (a is less than b by some ordering criterion) {
      //     return -1;
      //   }
      //   if (a is greater than b by the ordering criterion) {
      //     return 1;
      //   }
      //   // a must be equal to b
      //   return 0;
      // }

      // eslint-disable-next-line global-require,import/no-dynamic-require
      .map((file) => require(`${__dirname}/commands/${file.base}`));

    commands.forEach((Command) => {
      this.addCommand(new Command());
    });
  }
}

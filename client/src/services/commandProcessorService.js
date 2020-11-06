const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readDir = promisify(fs.readdir);

module.exports = class CommandProcessorService {
  constructor() {
    if (typeof CommandProcessorService.instance === 'object') {
      return CommandProcessorService.instance;
    }
    CommandProcessorService.instance = this;
    this.commands = new Map();
    return this;
  }

  addCommand(Command) {
    const command = new Command();

    if (Array.isArray(command.name)) {
      command.name.forEach((name) => this.commands.set(name, new Command()));
    } else {
      this.commands.set(command.name, command);
    }
  }

  async selectCommandAndExecute(data) {
    if (!this.commands.has(data.command)) {
      throw new Error('No such command');
    }
    return this.commands.get(data.command).execute(data);
  }

  async initialize() {
    const fileNames = await readDir(path.normalize(`${__dirname}/commands`));

    const commands = fileNames
      .map((file) => path.parse(file))
      .filter((file) => file.ext === '.js' && file.name !== 'baseCommand')
      // eslint-disable-next-line global-require,import/no-dynamic-require
      .map((file) => require(`${__dirname}/commands/${file.base}`));

    commands.forEach((Command) => this.addCommand(Command));
  }
};

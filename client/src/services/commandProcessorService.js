const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const logger = require('../helper/logger');

const readDir = promisify(fs.readdir);

module.exports = class CommandProcessorService {
  constructor(channel) {
    if (typeof CommandProcessorService.instance === 'object') {
      return CommandProcessorService.instance;
    }
    CommandProcessorService.instance = this;
    this.commands = new Map();
    this.channel = channel;
    return this;
  }

  addCommand(Command) {
    const command = new Command(this.channel);

    if (Array.isArray(command.name)) {
      command.name.forEach((name) => this.commands.set(name, Command));
    } else {
      this.commands.set(command.name, Command);
    }
  }

  getCommand(name) {
    if (!this.commands.has(name)) {
      throw new Error('No such command');
    }
    const Command = this.commands.get(name);
    return new Command(this.channel);
  }

  async selectCommandAndExecute(msg) {
    const message = JSON.parse(msg.content.toString());
    if (!message) {
      throw new Error('Message empty');
    }
    logger.debug(`Message from server: ${JSON.stringify(message, null, 2)}`);

    const command = this.getCommand(message.command);
    command.msg = msg;
    command.chatId = message?.chatId;
    return command.execute(message);
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

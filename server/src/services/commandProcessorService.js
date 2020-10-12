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
    this.commands = [];
    this.itemOrder = [
      'startCommand',
      'helpCommand',
      'menuCommand',
      'changeVoiceCommand',
      'selectedVoiceCommand',
      'languagesCommand',
      'voiceListCommand',
      'stopAudioCommand',
      // ...
      'callbackCommand',
      'textCommand',
    ];
    return this;
  }

  addCommand(command) {
    this.commands.push(command);
  }

  getCommands() {
    return this.commands;
  }

  async initializeCommands() {
    const fileNames = await readDir(path.normalize(`${__dirname}/commands`));

    const commands = fileNames
      .map((file) => path.parse(file))
      .filter((file) => file.ext === '.js' && file.name !== 'baseCommand')
      .sort((a, b) => (this.itemOrder.indexOf(a.name) > this.itemOrder.indexOf(b.name) ? 1 : -1))
      // eslint-disable-next-line global-require,import/no-dynamic-require
      .map((file) => require(`${__dirname}/commands/${file.base}`));

    commands.forEach((Command) => {
      this.addCommand(new Command());
    });
  }
};

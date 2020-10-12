const BaseCommand = require('./baseCommand');

module.exports = class StartCommand extends BaseCommand {
  constructor() {
    super();
    this.name = null;
    this.type = 'start';
  }

  async execute(ctx) {
    return this.sendResponseAndTranslate('hello_message', ctx);
  }
};

const BaseCommand = require('./baseCommand');

module.exports = class ManageClientCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['clients'];
    this.type = 'command';
    this.hears = this.i18n.translateAll('manage_clients');
  }

  execute(ctx) {
    return ctx.reply('TO DO');
  }
};

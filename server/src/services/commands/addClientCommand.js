const logger = require('../../helper/logger');
const BaseCommand = require('./baseCommand');

module.exports = class AddClientCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['add_client'];
    this.type = 'command';
  }

  // todo handle client with the same accessKey
  // todo handle empty client creation
  async execute(ctx) {
    super.execute(ctx);

    const [, name, accessKey, type] = ctx.message.text.split(' ');
    if (!name || !accessKey || !type) {
      return this.sendResponseAndTranslate('add_new_pig_error');
    }
    const client = {
      accessKey,
      type,
      name: name.replace(/-/gm, ' '),
      addedBy: ctx.user.telegramId,
    };
    try {
      await this.updateUser(ctx, { clients: [...ctx.user.clients, client] });
    } catch (e) {
      logger.error(e);
      return this.sendResponseAndTranslate('add_new_pig_error');
    }
    return this.sendResponseAndTranslate('done');
  }
};

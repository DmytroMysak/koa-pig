const _ = require('lodash');
const { Markup } = require('telegraf');
const BaseCommand = require('./baseCommand');

module.exports = class ManageClientCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['clients'];
    this.type = 'command';
    this.hears = this.i18n.translateAll('manage_clients');
  }

  execute(ctx) {
    super.execute(ctx);
    const selectedClients = ctx.user.selectedClients
      .map((clientId) => ctx.user.clients.find((el) => el.id === clientId));

    const active = selectedClients
      .sort((a, b) => b.name - a.name)
      .map((client) => Markup.callbackButton(`${client.name} 🔥`, `${this.clientTogglePrefix}${client.id}`));

    const inactive = _.differenceBy(ctx.user.clients, selectedClients, 'id')
      .sort((a, b) => b.name - a.name)
      .map((client) => Markup.callbackButton(`${client.name} 💤`, `${this.clientTogglePrefix}${client.id}`));

    return this.sendResponseAndTranslate(
      'pig_list',
      Markup.inlineKeyboard([
        ...active,
        ...inactive,
        Markup.callbackButton(this.translate('add_new_pig'), this.clientAddPrefix),
        Markup.callbackButton(this.translate('find_private_pig'), this.clientFindPrivatePrefix),
        Markup.callbackButton(this.translate('find_public_pig'), this.clientFindPublicPrefix),
      ], { columns: 1 }).extra(),
    );
  }
};

const _ = require('lodash');
const { Markup } = require('telegraf');
const User = require('../../models/users');
const BaseCommand = require('./baseCommand');
const SelectedStateCommand = require('./selectedStateCommand');
const ChangeVoiceCommand = require('./changeVoiceCommand');
const MenuCommand = require('./menuCommand');
const voiceService = require('../voiceService');

module.exports = class CallbackCommand extends BaseCommand {
  constructor() {
    super();
    this.type = 'on';
    this.name = 'callback_query';
  }

  async execute(ctx) {
    super.execute(ctx);

    if (ctx.callbackQuery.data === '/selected') {
      return new SelectedStateCommand().execute(ctx);
    }
    if (ctx.callbackQuery.data === '/changeVoice') {
      return new ChangeVoiceCommand().execute(ctx);
    }
    if (ctx.callbackQuery.data === this.clientAddPrefix) {
      return this.sendResponseAndTranslate('add_new_pig_instruction');
    }
    if (ctx.callbackQuery.data === this.clientFindPrivatePrefix) {
      return this.sendResponseAndTranslate('find_private_pig_instruction');
    }
    if (ctx.callbackQuery.data === this.clientFindPublicPrefix) {
      return this.findPublicClient(ctx);
    }
    if (ctx.callbackQuery.data.startsWith(this.clientTogglePrefix)) {
      return this.updateClient(ctx);
    }
    if (ctx.callbackQuery.data.startsWith(this.voiceChangePrefix)) {
      return this.changeVoice(ctx);
    }
    if (ctx.callbackQuery.data.startsWith(this.languageChangePrefix)) {
      return this.changeLanguage(ctx);
    }
    if (ctx.callbackQuery.data.startsWith(this.localeChangePrefix)) {
      return this.changeLocale(ctx);
    }
    return this.sendResponseAndTranslate('no_idea_what_to_do');
  }

  async updateClient(ctx) {
    const clientId = ctx.callbackQuery.data.replace(this.clientTogglePrefix, '');
    const { clients } = ctx.user;

    if (!ctx.user.clients.find((el) => el.id === clientId)) {
      const client = (await User.findOne({ 'clients._id': clientId }).select('clients')).clients.find((el) => el.id === clientId);
      if (!client) {
        return this.sendResponseAndTranslate('not_found');
      }
      clients.push(client);
    }
    const selectedClients = ctx.user.selectedClients.includes(clientId)
      ? ctx.user.selectedClients.filter((id) => id !== clientId)
      : [...ctx.user.selectedClients, clientId];

    await this.updateUser(ctx, { selectedClients, clients });
    return this.sendResponseAndTranslate('done');
  }

  async findPublicClient(ctx) {
    const userAvailableClients = ctx.user.clients.map((client) => client.id);
    const publicClients = (await User.find({ 'clients.type': 'public' }).select('clients'))
      .flatMap((user) => user.toJSON()?.clients)
      .filter((client) => client.type === 'public' && !userAvailableClients.includes(client.id))
      .sort((a, b) => b.name - a.name)
      .map((client) => Markup.callbackButton(`${client.name} 💤`, `${this.clientTogglePrefix}${client.id}`));

    if (_.isEmpty(publicClients)) {
      return this.sendResponseAndTranslate('no_pigs');
    }
    return this.sendResponseAndTranslate(
      'pig_list',
      Markup.inlineKeyboard(publicClients, { columns: 1 }).extra(),
    );
  }

  async changeVoice(ctx) {
    const voiceId = ctx.callbackQuery.data.replace(this.voiceChangePrefix, '');
    await this.updateUser(ctx, { 'settings.voiceId': voiceId });

    return this.sendResponseAndTranslate('done');
  }

  async changeLanguage(ctx) {
    const languageId = ctx.callbackQuery.data.replace(this.languageChangePrefix, '');
    const voiceList = voiceService.getVoicesList(languageId);
    const voicesKeyboard = Markup.inlineKeyboard(
      voiceList.map((el) => Markup.callbackButton(
        `${el.name}(${el.gender}, ${el.languageCode})`,
        `${this.voiceChangePrefix}${el.id}`,
      )),
      { columns: 2 },
    ).extra();

    return this.sendResponseAndTranslate('voice_list', voicesKeyboard);
  }

  async changeLocale(ctx) {
    const locale = ctx.callbackQuery.data.replace(this.localeChangePrefix, '');
    await this.updateUser(ctx, { 'settings.locale': locale });
    const menu = new MenuCommand().getMenu(ctx);

    return this.sendResponseAndTranslate('done', menu);
  }
};

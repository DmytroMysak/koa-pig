const { Markup, Extra } = require('telegraf');
const BaseCommand = require('./baseCommand');

module.exports = class ChangeVoiceCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['change', 'c'];
    this.type = 'command';
  }

  async execute(ctx) {
    const languageListText = this.i18n.translate('language_list', ctx.user.locale);
    const voiceListText = this.i18n.translate('voice_list', ctx.user.locale);

    this.sendResponseAndTranslate('change_voice_instructions', ctx);

    return ctx.reply(Extra.HTML().markup((m) => m.inlineKeyboard([
      Markup.callbackButton(languageListText, '/l'),
      Markup.callbackButton(voiceListText, '/v'),
    ])));
  }
};

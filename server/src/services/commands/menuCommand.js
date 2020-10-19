const { Markup } = require('telegraf');
const BaseCommand = require('./baseCommand');

module.exports = class MenuCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['menu', 'm'];
    this.type = 'command';
  }

  async execute(ctx) {
    const selectedVoiceText = this.i18n.translate('selected_voice', ctx.user.settings.locale);
    const changeVoiceText = this.i18n.translate('change_voice', ctx.user.settings.locale);
    const changeLanguageText = this.i18n.translate('language', ctx.user.settings.locale);
    const manageClientsText = this.i18n.translate('manage_clients', ctx.user.settings.locale);

    // await ctx.reply('remove keyboard', Markup.removeKeyboard());

    return ctx.reply(
      this.i18n.translate('menu', ctx.user.settings.locale),
      Markup.keyboard([
        [
          Markup.button(selectedVoiceText),
          Markup.button(changeVoiceText),
        ],
        [
          Markup.button(changeLanguageText),
          Markup.button(manageClientsText),
        ],
      ]).resize().extra(),
    );
  }
};

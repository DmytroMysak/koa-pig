import { Extra, Markup } from 'telegraf';
import BaseCommand from './baseCommand';

export default class MenuCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['menu', 'm'];
    this.type = 'command';
  }

  async execute(ctx) {
    const selectedVoiceText = this.i18n.translate('selected_voice', ctx.user.locale);
    const changeVoiceText = this.i18n.translate('change_voice', ctx.user.locale);
    const languageListText = this.i18n.translate('language_list', ctx.user.locale);
    const voiceListText = this.i18n.translate('voice_list', ctx.user.locale);

    return ctx.reply('menu', Extra.HTML().markup((m) => m.inlineKeyboard([
      [Markup.callbackButton(selectedVoiceText, '/s'), Markup.callbackButton(changeVoiceText, '/c')],
      [Markup.callbackButton(languageListText, '/l'), Markup.callbackButton(voiceListText, '/v')],
    ])));
  }
}

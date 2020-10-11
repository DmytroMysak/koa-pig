import { Markup, Extra } from 'telegraf';
import BaseCommand from './baseCommand';

export default class ChangeVoiceCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['change', 'c'];
    this.type = 'command';
  }

  async execute(ctx) {
    const languageListText = await this.i18n.translate('language_list', ctx.user.locale);
    const voiceListText = await this.i18n.translate('voice_list', ctx.user.locale);
    await this.sendResponseAndTranslate('change_voice_instructions', ctx);
    return ctx.reply(Extra.HTML().markup((m) => m.inlineKeyboard([
      Markup.callbackButton(languageListText, '/l'),
      Markup.callbackButton(voiceListText, '/v'),
    ])));
  }
}

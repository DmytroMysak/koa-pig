const BaseCommand = require('./baseCommand');
const SelectedVoiceCommand = require('./selectedVoiceCommand');
const ChangeVoiceCommand = require('./changeVoiceCommand');
const User = require('../../models/users');

module.exports = class CallbackCommand extends BaseCommand {
  constructor() {
    super();
    this.type = 'on';
    this.name = 'callback_query';
  }

  async execute(ctx) {
    if (ctx.callbackQuery.data === '/selected') {
      return new SelectedVoiceCommand().execute(ctx);
    }
    if (ctx.callbackQuery.data === '/changeVoice') {
      return new ChangeVoiceCommand().execute(ctx);
    }
    if (ctx.callbackQuery.data.startsWith(this.voiceChangePrefix)) {
      const voiceId = ctx.callbackQuery.data.replace(this.voiceChangePrefix, '');
      await User.updateOne({ telegramId: ctx.user.telegramId }, { 'settings.voiceId': voiceId });
      return this.sendResponseAndTranslate('voice_changed', ctx);
    }
    if (ctx.callbackQuery.data.startsWith(this.localeChangePrefix)) {
      const locale = ctx.callbackQuery.data.replace(this.localeChangePrefix, '');
      await User.updateOne({ telegramId: ctx.user.telegramId }, { 'settings.locale': locale });
      return this.sendResponseAndTranslate('localization_changed', ctx);
    }
    return this.sendResponseAndTranslate('no_idea_what_to_do', ctx);
  }
};

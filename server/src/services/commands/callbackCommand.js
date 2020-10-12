const BaseCommand = require('./baseCommand');
const SelectedVoiceCommand = require('./selectedVoiceCommand');
const LanguagesCommand = require('./languagesCommand');
const ChangeVoiceCommand = require('./changeVoiceCommand');
const VoiceListCommand = require('./voiceListCommand');
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
    if (ctx.callbackQuery.data === '/languages') {
      return new LanguagesCommand().execute(ctx);
    }
    if (ctx.callbackQuery.data === '/changeVoice') {
      return new ChangeVoiceCommand().execute(ctx);
    }
    if (ctx.callbackQuery.data === '/voices') {
      return new VoiceListCommand().execute(ctx);
    }
    if (ctx.callbackQuery.data.startsWith(this.languageChangePrefix)) {
      const languageId = ctx.callbackQuery.data.replace(this.languageChangePrefix, '');
      return new VoiceListCommand().execute(ctx, languageId);
    }
    if (ctx.callbackQuery.data.startsWith(this.voiceChangePrefix)) {
      const voiceId = ctx.callbackQuery.data.replace(this.voiceChangePrefix, '');
      await User.updateOne({ telegramId: ctx.user.telegramId }, { 'settings.voiceId': voiceId });
      return this.sendResponseAndTranslate('voice_changed', ctx);
    }
    return this.sendResponseAndTranslate('no_idea_what_to_do', ctx);
  }
};

import BaseCommand from './baseCommand';
import config from '../../../config/env';

export default class SelectedVoiceCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['selected', 'sl'];
    this.type = 'command';
  }

  async execute(ctx) {
    if (!ctx.user.voice) {
      return ctx.reply(`${config.defaultVoiceId}(Male, Russian)`);
    }
    return this.userService.getUserVoice(ctx.user.id)
      .then((voice) => ctx.reply(`${voice.name}(${voice.gender}, ${voice.languageName})`))
      .catch((error) => this.telegramErrorLogging(error, ctx));
  }
}

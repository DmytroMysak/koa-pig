const BaseCommand = require('./baseCommand');
const config = require('../../config/env');
const voiceService = require('../voiceService');

module.exports = class SelectedVoiceCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['selected', 'sl'];
    this.type = 'command';
  }

  async execute(ctx) {
    const voice = voiceService.getById(ctx.user.settings.voiceId || config.defaultVoiceId);

    return this.sendResponseAndTranslate(`${voice.name}(${voice.gender}, ${voice.languageName})`, ctx);
  }
};

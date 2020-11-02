const BaseCommand = require('./baseCommand');
const config = require('../../config');
const voiceService = require('../voiceService');

module.exports = class SelectedVoiceCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['selected', 'sl'];
    this.type = 'command';
    this.hears = this.i18n.translateAll('selected_voice');
  }

  async execute(ctx) {
    super.execute(ctx);

    const voice = voiceService.getById(ctx.user.settings.voiceId || config.defaultVoiceId);

    return this.sendResponseAndTranslate(`${voice.name}(${voice.gender}, ${voice.languageName})`);
  }
};

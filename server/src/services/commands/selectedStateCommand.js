const BaseCommand = require('./baseCommand');
const config = require('../../config');
const voiceService = require('../voiceService');

module.exports = class SelectedStateCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['selected', 'sl'];
    this.type = 'command';
    this.hears = this.i18n.translateAll('selected_state');
  }

  async execute(ctx) {
    super.execute(ctx);
    const { voiceId, volume } = ctx.user.settings;
    const voice = voiceService.getById(voiceId || config.defaultVoiceId);
    const volumeText = `${this.translate('volume')}: ${volume}`;
    const voiceText = `${voice.name}(${voice.gender}, ${voice.languageName})`;

    return this.sendResponseAndTranslate(`${voiceText}\n${volumeText}`);
  }
};

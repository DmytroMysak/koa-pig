const BaseCommand = require('./baseCommand');

module.exports = class HelpCommand extends BaseCommand {
  constructor() {
    super();
    this.name = null;
    this.type = 'help';
  }

  async execute(ctx) {
    super.execute(ctx);

    const commandListText = this.translate('command_list:');
    const callMenuText = this.translate('call_menu');
    const returnCurrentVoiceText = this.translate('return_current_voice');
    const changeVoiceHelpText = this.translate('change_voice_help');
    const stopCurrentAudioText = this.translate('stop_current_audio');
    const changeVolumeHelpText = this.translate('change_volume_help');

    return this.sendResponseAndTranslate([
      commandListText,
      callMenuText,
      returnCurrentVoiceText,
      changeVoiceHelpText,
      stopCurrentAudioText,
      changeVolumeHelpText,
    ].join('\n '));
  }
};

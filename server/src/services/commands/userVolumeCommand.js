const BaseCommand = require('./baseCommand');

module.exports = class UserVolumeCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['volume', 'vl'];
    this.type = 'command';
  }

  async execute(ctx) {
    super.execute(ctx);

    const volume = parseInt(ctx.message.text.replace(/\D/gm, ''), 10);
    if (!volume || Number.isNaN(volume)) {
      return this.sendResponseAndTranslate('bad_volume_value');
    }
    await this.updateUser(ctx, { 'settings.volume': volume });

    return this.sendResponseAndTranslate('volume_changed');
  }
};

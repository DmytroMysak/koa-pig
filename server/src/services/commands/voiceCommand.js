const BaseCommand = require('./baseCommand');
const clientService = require('../clientService');

module.exports = class VoiceCommand extends BaseCommand {
  constructor() {
    super();
    this.type = 'on';
    this.name = 'voice';
  }

  async execute(ctx) {
    super.execute(ctx);
    const link = await ctx.telegram.getFileLink(ctx.update.message.voice.file_id);

    return clientService.sendToClients({
      volume: ctx.user.settings.volume,
      chatId: ctx.chat.id,
      link,
      command: 'play-song-telegram',
    }, ctx.user);
  }
};

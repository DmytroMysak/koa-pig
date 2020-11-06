const BaseCommand = require('./baseCommand');
const clientService = require('../clientService');

module.exports = class TextCommand extends BaseCommand {
  constructor() {
    super();
    this.type = 'on';
    this.name = 'audio';
  }

  async execute(ctx) {
    super.execute(ctx);
    const link = await ctx.telegram.getFileLink(ctx.update.message.audio.file_id);

    return clientService.sendToClients({
      volume: ctx.user.settings.volume,
      chatId: ctx.chat.id,
      link,
      command: 'play-song-telegram',
    }, ctx.user.selectedClients);
  }
};

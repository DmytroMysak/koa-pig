const isUrl = require('is-url');
const BaseCommand = require('./baseCommand');
const clientService = require('../clientService');
const { createFileLink, createFileName, getYoutubeId } = require('../../helper/util');
const bucketService = require('../bucketService');
const awsService = require('../awsService');

module.exports = class TextCommand extends BaseCommand {
  constructor() {
    super();
    this.type = 'on';
    this.name = 'text';
  }

  async execute(ctx) {
    super.execute(ctx);
    const { message: { text } } = ctx;

    if (isUrl(text)) {
      return this.processUrl(text);
    }
    if (text.length > 1500) {
      return this.sendResponseAndTranslate('sorry_to_big');
    }
    return this.processText(text);
  }

  async processUrl(text) {
    if (!getYoutubeId(text)) {
      return this.sendResponseAndTranslate('sorry_only_youtube');
    }
    return clientService.sendToClients({
      volume: this.ctx.user.settings.volume,
      chatId: this.ctx.chat.id,
      link: text,
      command: 'play-song-youtube',
    }, this.ctx.user.selectedClients);
  }

  async processText(text) {
    const fileName = createFileName(text, this.ctx.user.settings.voiceId);

    if (!(await bucketService.isExistFile(fileName))) {
      const file = await awsService.createAudioFileFromText(text, this.ctx.user.settings.voiceId);
      await bucketService.uploadFile(fileName, file);
    }

    return Promise.all([
      this.sendAudio(text, fileName),
      clientService.sendToClients({
        volume: this.ctx.user.settings.volume,
        chatId: this.ctx.chat.id,
        link: createFileLink(fileName),
        command: 'play-song-bucket',
      }, this.ctx.user.selectedClients),
    ]);
  }

  async sendAudio(text, fileName) {
    const title = text.length > 23 ? `${text.substring(0, 20)}...` : text;

    return this.ctx.replyWithAudio({ url: createFileLink(fileName), filename: title }, {
      performer: 'Little Pig Bot',
      title,
      disable_notification: true,
      reply_to_message_id: this.ctx.message.message_id,
    });
  }
};

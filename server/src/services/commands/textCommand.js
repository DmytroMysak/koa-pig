const BaseCommand = require('./baseCommand');
const ClientService = require('../clientService');
const { createFileLink, createFileName } = require('../../helper/util');
const bucketService = require('../bucketService');
const awsService = require('../awsService');

// eslint-disable-next-line max-len
const isUrl = (text) => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi.test(text.toString());

module.exports = class TextCommand extends BaseCommand {
  constructor() {
    super();
    this.type = 'on';
    this.name = 'text';
  }

  async execute(ctx) {
    const { message: { text } } = ctx;
    if (isUrl(text)) {
      if (!text.includes('youtube')) {
        return this.sendResponseAndTranslate('sorry_only_youtube', ctx);
      }
      return ClientService.sendToClients({
        link: text,
        command: 'play-youtube-song',
        volume: ctx.user.settings.volume,
      }, ctx.user.selectedClients);
    }

    const fileName = createFileName(text, ctx.user.settings.voiceId);
    const songExist = await bucketService.isExistFile(fileName);

    if (!songExist) {
      const file = await awsService.createAudioFileFromText(text, ctx.user.settings.voiceId);
      await bucketService.uploadFile(fileName, file);
    }

    return ClientService.sendToClients({
      link: createFileLink(fileName),
      command: 'play-song',
      volume: ctx.user.settings.volume,
    }, ctx.user.selectedClients);
  }
};

const BaseCommand = require('./baseCommand');
const ClientService = require('../clientService');

module.exports = class StopAudioCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['stopAll'];
    this.type = 'command';
  }

  async execute(ctx) {
    super.execute(ctx);

    return ClientService.sendToClients({ command: 'stop-all-songs' }, ctx.user);
  }
};

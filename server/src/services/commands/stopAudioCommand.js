const BaseCommand = require('./baseCommand');
const ClientService = require('../clientService');

module.exports = class StopAudioCommand extends BaseCommand {
  constructor() {
    super();
    this.name = ['stop', 's'];
    this.type = 'command';
  }

  async execute(ctx) {
    super.execute(ctx);

    return ClientService.sendToClients({ command: 'stop-song' }, ctx.user);
  }
};

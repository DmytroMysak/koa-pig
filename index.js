import fs from 'fs';
import localTunnelPromise from './localTunnelPromise';
import config from './config/env';
// import PigService from './businessLogic/pigBL';
import TelegramBot from './businessLogic/bots/TelegramBot';

// const pigService = new PigService();

// function to go over all bots and start them
const startBots = (appUrl) => {
  const telegramBot = new TelegramBot(appUrl);

  return Promise.all([
    telegramBot.start(appUrl),
  ]);
};

// Create the songs directory if it doesn't exist
if (!fs.existsSync(config.folderToSaveSongs)) {
  fs.mkdirSync(config.folderToSaveSongs);
}
// Create the log directory if it does not exist
if (!fs.existsSync(config.folderToSaveLogs)) {
  fs.mkdirSync(config.folderToSaveLogs);
}

localTunnelPromise(config.port)
  .then(result => Promise.all([
    result.url,
    // pigService.updateVoice()
  ]))
  .then(url => startBots(url))
  .catch(err => console.error(err));

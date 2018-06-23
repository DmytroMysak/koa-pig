import Player from 'play-sound';
import fs from 'fs';
import logger from '../helper/logger';
// import path from 'path';
// import config from '../config/env';

export default class Audio {
  constructor() {
    this.player = new Player();
  }

  saveStreamToFile(audioData, stream) {
    fs.createWriteStream(audioData.pathToFile)
      .write(stream.AudioStream)
      .on('finish', () => logger.info(`added file ${audioData.pathToFile}`))
      .end();
  }

  playSong(audioData) {
    return this.player.play(audioData.pathToFile, (err) => {
      if (err) {
        throw err;
      }
    });
  }
}

// const audio = new Audio();
// const pathToFile = path.normalize(`${__dirname}/../../${config.folderToSaveSongs}/armata.mp3`);
// audio.playSong({ pathToFile });

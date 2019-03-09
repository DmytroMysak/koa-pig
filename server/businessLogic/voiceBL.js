import VoicesDao from '../dataAccess/VoicesDao';
import { models } from '../models';
import logger from '../helper/logger';

export default class VoiceService {
  constructor() {
    this.voicesDao = new VoicesDao(models);
  }

  getLanguagesList(unique) {
    return this.voicesDao.getVoices(unique)
      .then(data => ({
        rows: data.rows.map(voice => ({ name: voice.languageName, code: voice.languageCode })),
        count: data.count.length,
      }))
      .catch(err => logger.error(err));
  }

  getVoicesList(languageCode = null) {
    const filter = {
      ...languageCode ? { languageCode } : {},
    };
    return this.voicesDao.getVoices(false, filter);
  }

  getSpeakersNameList(id = null) {
    return this.voicesDao.getVoices(false, ...id ? { languageCode: id } : {})
      .then(data => ({
        rows: data.rows.map(voice => ({ name: voice.name, id: voice.id, gender: voice.gender })),
        count: data.count,
      }))
      .catch(err => logger.error(err));
  }
}

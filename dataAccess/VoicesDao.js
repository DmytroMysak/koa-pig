import _ from 'lodash';

export default class VoicesDao {
  constructor(models) {
    this.voices = models.voices;
  }

  upsertVoice(voice) {
    return this.voices.upsert(voice);
  }

  getVoices(unique = false, filter = null) {
    return this.voices.findAndCountAll({
      ...unique ? { attributes: ['languageName', 'languageCode'] } : {},
      ...unique ? { group: ['languageName', 'languageCode'] } : {},
      distinct: unique,
      col: 'languageCode',
      ..._.isEmpty(filter) ? {} : { where: filter },
    });
  }
}

import _ from 'lodash';

export default class VoicesDao {
  constructor(models) {
    this.voices = models.voices;
  }

  saveVoices(voices) {
    return this.voices.create(voices);
  }

  getVoices(unique = false, filter = null) {
    return this.voices.findAndCountAll({
      distinct: unique,
      ..._.isEmpty(filter) ? {} : { where: filter },
    });
  }
}

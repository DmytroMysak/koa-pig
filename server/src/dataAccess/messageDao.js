import _ from 'lodash';
import sequelize from '../models';

export default class messageDao {
  constructor(models) {
    this.messages = models.messages;
  }

  saveMessage(messageObject) {
    return this.messages.create(messageObject, { returning: true });
  }

  updateMessage(id, messageObject, fieldsToUpdate = null) {
    const updatedFields = _.omit(this.messages.attributes, ['id', 'createdAt']);

    return this.messages.update(
      messageObject,
      {
        fields: fieldsToUpdate || Object.keys(updatedFields),
        where: { id },
        returning: true,
      },
    )
      .then(([affectedRows, rows]) => (affectedRows && rows[0]) || {});
  }

  addAudioIdByFileName(messageId, fileName) {
    return this.messages.update(
      { audioId: sequelize.literal(`(select id from "audio" where "fileName" = '${fileName}')`) },
      {
        fields: ['audioId'],
        where: { id: messageId },
        returning: true,
      },
    );
  }
}

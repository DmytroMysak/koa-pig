import axios from 'axios';
import PigService from './pigBL';
import UserDao from '../dataAccess/UserDao';
import { models } from '../models';
import config from '../config/env';
import logger from '../helper/logger';

const { chatData: ChatDataModel } = models;

export default class BotService {
  constructor() {
    axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
    this.axios = axios.create({
      baseURL: 'https://graph.facebook.com/v3.0/me',
    });
    this.pigService = new PigService();
    this.userDao = new UserDao(models);
  }

  handleMessage(message, user) {
    const { text } = message;
    return ChatDataModel.build({ text, voiceId: user.selectedVoiceId || config.defaultVoiceId, userId: user.id })
      .validate()
      .then(chatData => this.pigService.pigSpeak(chatData.get()));
  }

  handlePostBack(postback, user) {
    const prefixToVoiceChangePayload = 'CHANGE_VOICE_ID_FOR_CURRENT_USER_TO_';
    const prefixToLanguagePayload = 'SELECTED_LANGUAGE_IS_';

    if (postback.payload === 'LANGUAGE_LIST') {
      return this.pigService.getLanguagesList(true)
        .then((languageList) => {
          const [list, chuckSize] = [languageList.rows, 3];
          const array = new Array(Math.ceil(list.length / chuckSize)).fill().map(() => list.splice(0, chuckSize));
          return array.map(languages => ({
            attachment: {
              type: 'template',
              payload: {
                template_type: 'button',
                text: '​',
                buttons: languages.map(language => ({
                  type: 'postback',
                  title: language.name,
                  payload: `${prefixToLanguagePayload}${language.code}`,
                })),
              },
            },
          }));
        })
        .then(responses => Promise.all([responses, this.sendResponseToFb(user.facebookId, { text: 'Select language' })]))
        .then(([responses]) => Promise.all(responses.map(response => this.sendResponseToFb(user.facebookId, response))))
        .catch(error => logger.info(error));
    }

    if (postback.payload.includes(prefixToLanguagePayload)) {
      const languageId = postback.payload.replace(prefixToLanguagePayload, '');
      return this.pigService.getVoicesList(languageId)
        .then((voiceList) => {
          const [list, chuckSize] = [voiceList.rows, 3];
          const array = new Array(Math.ceil(list.length / chuckSize)).fill().map(() => list.splice(0, chuckSize));
          return array.map(voices => ({
            attachment: {
              type: 'template',
              payload: {
                template_type: 'button',
                text: '​',
                buttons: voices.map(voice => ({
                  type: 'postback',
                  title: voice.name,
                  payload: `${prefixToVoiceChangePayload}${voice.id}`,
                })),
              },
            },
          }));
        })
        .then(responses => Promise.all([responses, this.sendResponseToFb(user.facebookId, { text: 'Select voice' })]))
        .then(([responses]) => Promise.all(responses.map(response => this.sendResponseToFb(user.facebookId, response))))
        .catch(error => logger.info(error));
    }

    if (postback.payload.includes(prefixToVoiceChangePayload)) {
      const voiceId = postback.payload.replace(prefixToVoiceChangePayload, '');
      return this.userDao.updateUserVoiceId(user.id, voiceId)
        .then(() => this.sendResponseToFb(user.facebookId, { text: 'Voice changed' }));
    }

    if (postback.payload === 'CURRENT_VOICE') {
      return this.sendResponseToFb(user.facebookId, { text: user.voices ? user.voices.name : config.defaultVoiceId });
    }
  }

  sendResponseToFb(userFacebookId, response) {
    return this.axios.post(`/messages?access_token=${config.accessToken}`, {
      messaging_type: 'RESPONSE',
      recipient: { id: userFacebookId },
      message: response,
    })
      .catch(error => logger.info(error));
  }

  addPersistentMenu() {
    return this.axios.post(`/messenger_profile?access_token=${config.accessToken}`, {
      persistent_menu: [
        {
          locale: 'default',
          composer_input_disabled: false,
          call_to_actions: [
            {
              title: 'Change voice',
              type: 'postback',
              payload: 'LANGUAGE_LIST',
            },
            {
              title: 'Selected voice',
              type: 'postback',
              payload: 'CURRENT_VOICE',
            },
          ],
        },
      ],
    });
  }
}

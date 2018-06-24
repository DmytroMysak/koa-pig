import axios from 'axios';
import PigService from './pigBL';
import { models } from '../models';
import config from '../config/env';

const { chatData: ChatDataModel } = models;

export default class BotService {
  constructor() {
    this.pigService = new PigService();
  }
  handleMessage(message, user) {
    const { text } = message;
    return ChatDataModel.build({ text, voiceId: user.selectedVoiceId || config.defaultVoiceId, userId: user.id })
      .validate()
      .then(chatData => this.pigService.pigSpeak(chatData));
  }

  handlePostBack(postback, user) {
    let response;

    // Получим данные postback-уведомления
    let payload = received_postback.payload;

    // Сформируем ответ, основанный на данных уведомления
    if (payload === 'CAT_PICS') {
      response = imageTemplate('cats', sender_psid);
      callSendAPI(sender_psid, response, function(){
        callSendAPI(sender_psid, askTemplate('Show me more'));
      });
    } else if (payload === 'DOG_PICS') {
      response = imageTemplate('dogs', sender_psid);
      callSendAPI(sender_psid, response, function(){
        callSendAPI(sender_psid, askTemplate('Show me more'));
      });
    } else if(payload === 'GET_STARTED'){
      response = askTemplate('Are you a Cat or Dog Person?');
      callSendAPI(sender_psid, response);
    }
  }

  sendResponseToFb(sender_psid, response, cb = null) {
    axios.get('/user?ID=12345')
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    // Конструируем тело сообщения
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    };

    // Отправляем HTTP-запрос к Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": config.get('facebook.page.access_token') },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        if(cb){
          cb();
        }
      } else {
        console.error("Unable to send message:" + err);
      }
    });
  }
}

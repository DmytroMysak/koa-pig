import express from 'express';
import * as pigBL from '../businessLogic/pigBL';
import validator from '../helper/validator';

const router = express.Router();

router.post('/say', (req, res, next) => {
  const { text, voiceId } = req.body;

  return pigBL.pigSpeak(text, voiceId)
    .then(result => res.json(result))
    .catch(error => next(error));
});

router.get('/voices', (req, res, next) => pigBL.getVoicesList()
  .then(voices => res.json(voices))
  .catch(error => next(error)));

router.get('/languages', (req, res, next) => {
  if (req.query.unique && !validator.isBooleanString(req.query.unique)) {
    return new Error('Bad unique type, expected boolean');
  }
  const unique = (req.query.unique && req.query.unique === 'true') || false;

  return pigBL.getLanguagesList(unique)
    .then(voices => res.json(voices))
    .catch(error => next(error));
});

router.get('/speakers/:id', (req, res, next) => pigBL.getSpeakersNameList(req.params.id)
  .then(voices => res.json(voices))
  .catch(error => next(error)));

router.get('/speakers', (req, res, next) => pigBL.getSpeakersNameList()
  .then(voices => res.json(voices))
  .catch(error => next(error)));

export default router;

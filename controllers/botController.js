import express from 'express';

const router = express.Router(); // eslint-disable-line new-cap

router.get('/ping', (req, res) => res.send('pong'));

router.get('', (req, res) => {

});

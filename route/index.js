import express from 'express';

const router = express.Router(); // eslint-disable-line new-cap

router.get('/', (req, res) => res.send('Hello World!'));

export default router;

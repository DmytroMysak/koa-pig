import express from 'express';
import pigRoute from '../controllers/pigController';
import botRoute from '../controllers/botController';

const router = express.Router();

router.use('/pig', pigRoute);
router.use('/bot', botRoute);

export default router;

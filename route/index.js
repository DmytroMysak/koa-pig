import express from 'express';
import pigRoute from '../controllers/pigController';
import messengerRoute from '../controllers/messengerServiceController';

const router = express.Router();

router.use('/pig', pigRoute);
router.use('/bot/messenger', messengerRoute);

export default router;

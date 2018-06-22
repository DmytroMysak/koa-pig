import express from 'express';
import pigRoute from '../controllers/pigController';

const router = express.Router();

router.use('/pig', pigRoute);

export default router;

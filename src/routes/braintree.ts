import express, { Router } from 'express';
import { requireSignin, isAuth } from '../controllers/auth';
import { userById } from '../controllers/user';
import { generateToken, processPayment } from '../controllers/braintree';

const router: Router = express.Router();

router.get('/braintree/getToken/:userId', requireSignin, isAuth, generateToken);
router.post('/braintree/payment/:userId', requireSignin, isAuth, processPayment);

router.param('userId', userById);

export default router;

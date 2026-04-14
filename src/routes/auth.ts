import express, { Router } from 'express';
import { signup, signin, signout } from '../controllers/auth';
import { userSignupValidator } from '../validator';

const router: Router = express.Router();

router.post('/signup', userSignupValidator, signup);
router.post('/signin', signin);
router.get('/signout', signout);

export default router;

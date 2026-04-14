import express, { Router, Request, Response } from 'express';
import { requireSignin, isAuth, isAdmin } from '../controllers/auth';
import {
  users,
  userById,
  read,
  update,
  purchaseHistory,
} from '../controllers/user';

const router: Router = express.Router();

router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req: Request, res: Response) => {
  res.json({
    user: (req as any).profile,
  });
});

router.get('/user/:userId', requireSignin, isAuth, read);
router.put('/user/:userId', requireSignin, isAuth, update);
router.get('/orders/by/user/:userId', requireSignin, isAuth, purchaseHistory);
router.get('/users', users);

router.param('userId', userById);

export default router;

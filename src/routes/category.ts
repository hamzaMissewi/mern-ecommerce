import express, { Router } from 'express';
import {
  create,
  categoryById,
  read,
  update,
  remove,
  list,
} from '../controllers/category';
import { requireSignin, isAuth, isAdmin } from '../controllers/auth';
import { userById } from '../controllers/user';

const router: Router = express.Router();

router.get('/category/:categoryId', read);
router.post('/category/create/:userId', requireSignin, isAuth, isAdmin, create);
router.put('/category/:categoryId/:userId', requireSignin, isAuth, isAdmin, update);
router.delete('/category/:categoryId/:userId', requireSignin, isAuth, isAdmin, remove);
router.get('/categories', list);

router.param('categoryId', categoryById);
router.param('userId', userById);

export default router;

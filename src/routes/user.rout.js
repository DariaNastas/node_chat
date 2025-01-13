import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { catchError } from '../utils/catchError.js';
import { validateUser } from '../utils/validateUser.js';

const router = express.Router();

router.get('/user/:id', catchError(userController.getOne));

router.post(
  '/user',
  express.json(),
  validateUser,
  catchError(userController.create),
);

export { router };

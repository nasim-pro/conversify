import { Router } from 'express'
export const userRouter = Router()
import { create, userList, login } from '../controller/user.controller.ts'
import { isAuthorize } from "../../middleware/verifyjwt.ts";

userRouter.post('/user', create);
userRouter.get('/user', isAuthorize,  userList );
userRouter.post('/user/login', login);


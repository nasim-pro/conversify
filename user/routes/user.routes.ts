import { Router } from 'express'
export const userRouter = Router()
import { create, userList, login } from '../controller/user.controller.ts'
import { isAuthorize } from "../../middleware/verifyjwt.ts";

userRouter.post('/', create);
userRouter.get('/', isAuthorize,  userList );
userRouter.post('/login', login);


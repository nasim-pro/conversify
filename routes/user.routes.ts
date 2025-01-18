import { Router } from 'express'
export const userRouter = Router()
import { create } from '../user/controller/user.controller.ts'

userRouter.post('/user', create);


import { Router } from 'express'
import { messageRouter } from './message/message.routes.ts'
import { userRouter } from './user/routes/user.routes.ts'

export const allRoute = Router();

allRoute.use('/user', userRouter);
allRoute.use('/message', messageRouter );


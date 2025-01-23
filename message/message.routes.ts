import { Router } from 'express';
import { messageList } from './message.controller.ts'
export const messageRouter = Router();

messageRouter.get('/history', messageList)


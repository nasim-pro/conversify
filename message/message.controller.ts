import { Request, Response } from 'express'
import { Message } from "./message.schema.ts"
export const messageList = async (req: Request, res: Response) => {
    // current user id reciver id, and other will be sender
    const { currentUserId, selectedUserId } = req.query;

    const messages = await Message.find({
        $or: [
            {
                senderId: selectedUserId,
                receiverId: currentUserId
            },
            {
                senderId: currentUserId,
                receiverId: selectedUserId
            }
        ]
    }).sort({timestamp: -1}).limit(20)

    res.status(200).send({ messages: messages.toReversed() })
}

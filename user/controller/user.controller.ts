import { Request, Response } from 'express';
import User, { IUser } from '../model/user.schema.ts';

export const create = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // Use the User model to create a new user
        const user: IUser = await User.create({ name, email, password });

        return res.status(201).send({
            success: true,
            message: "User created successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            success: false,
            message: "An error occurred while creating the user",
        });
    }
};

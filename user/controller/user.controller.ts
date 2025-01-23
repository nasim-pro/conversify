import { Request, Response } from 'express';
import User, { IUser } from '../model/user.schema.ts';
import { hash, verify } from '@felix/bcrypt'
import * as jwt from 'jsonwebtoken'

export const create = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        // Use the User model to create a new user
        const user: IUser = await User.create({ name, email, password: await hash(password) });
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

export const userList = async (_req: Request, res: Response)=>{
    const users = await User.find();
    res.status(200).send({
        success: true,
        message: "Users list",
        data: users
    })
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).send({ success: false, message: "Email and password is required" })
    }
    const user = await User.findOne({email});
    console.log("user", user);
    
    if (!user) {
        return res.status(404).send({ success: false, message: "User not found" })
    }
    
    const isMatch: boolean = await verify(password, user.password);
    
    if(!isMatch){
        return res.status(403).send({ success: false, message: "Email or password is incorrect" })
    }

    const secret = "MysecretWorld";

    const token = jwt.sign({user}, secret, { expiresIn: "2h" })
    
    return res.status(200).send({ success: true, message: "Logged in successfully", user, token })

}
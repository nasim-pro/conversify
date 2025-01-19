import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const secret = "MysecretWorld";

export const isAuthorize = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get the token from headers
        let token = req.headers["x-access-token"] || req.headers["authorization"];
        if (Array.isArray(token)) token = token[0]; // Handle array case

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        // If using "Bearer <token>" format, split to extract the token
        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length);
        }

        // Verify the token
        const decoded = jwt.verify(token, secret);
        req.user = decoded.user;
        console.log(req.user);
        
        // Proceed to the next middleware
        next();
    // deno-lint-ignore no-explicit-any
    } catch (error: any) {
        // Handle token errors
        return res.status(401).json({ message: "Unauthorized", error: error.message });
    }
};

import { Schema, model, Document } from 'mongoose';

// Define a TypeScript interface for the User document
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
}

// Define the Mongoose schema
const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
    },
    {
        timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
    }
);

// Export the Mongoose model
const User = model<IUser>('User', UserSchema);
export default User;

import express, {Request, Response } from 'express';
import process from 'node:process';
import { userRouter } from "./routes/user.routes.ts";
import { connectToDb } from "./db-config/db.config.ts"
connectToDb()
const PORT = process.env.PORT || 2025;
const app = express();

app.use(express.json());
app.use('/api', userRouter);
app.use('/', (_req: Request, res: Response) => {
   return res.status(200).send({ name: "Conversify", status: "Running", success: true });
});



app.listen(PORT, () => console.log(`Conversify server is running on port ${PORT}`));

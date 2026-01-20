import express from "express";
const app = express();
app.use(express.json());
import { authRouter } from "./routes/authRouter";
import { contestsRouter } from "./routes/contestsRouter";
app.use("/api/auth", authRouter);
app.use("/api/contests", contestsRouter);
app.listen(3000);

import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

import { authRouter } from "./routes/authRouter";
import { contestsRouter } from "./routes/contestsRouter";
import { problemRouter } from "./routes/problemRouter";

app.use("/api/auth", authRouter);
app.use("/api/contests", contestsRouter);
app.use("/api/problems", problemRouter);

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});

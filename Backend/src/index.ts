import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

const FRONTEND_ORIGINS =
  (process.env.FRONTEND_ORIGINS && process.env.FRONTEND_ORIGINS.split(",")) ||
  (process.env.FRONTEND_ORIGIN
    ? [process.env.FRONTEND_ORIGIN]
    : ["https://contest-platform-1-jlwp.onrender.com"]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (FRONTEND_ORIGINS.includes(origin)) return callback(null, true);
      console.warn(`CORS origin rejected: ${origin}`);
      return callback(new Error("CORS_NOT_ALLOWED"));
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

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

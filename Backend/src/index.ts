import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

const FRONTEND_ORIGINS =
  (process.env.FRONTEND_ORIGINS &&
    process.env.FRONTEND_ORIGINS.split(",").map((origin) => origin.trim())) ||
  (process.env.FRONTEND_ORIGIN
    ? [process.env.FRONTEND_ORIGIN]
    : ["https://contest-platform-1-jlwp.onrender.com"]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (FRONTEND_ORIGINS.includes(origin)) return callback(null, true);

      if (origin === "https://contest-platform-inky.vercel.app") {
        return callback(null, true);
      }

  
      try {
        const url = new URL(origin);
        const host = url.hostname;

        if (host.endsWith("vercel.app")) return callback(null, true);

        if (host.endsWith("onrender.com")) return callback(null, true);

        if (host === "localhost" || host.endsWith(".localhost"))
          return callback(null, true);
      } catch (e) {
        console.error("Error parsing origin:", origin, e);
      }

      console.warn(`CORS origin rejected: ${origin}`);
      return callback(new Error("CORS_NOT_ALLOWED"));
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200,
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

import cookieParser from "cookie-parser";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import type { HttpError } from "http-errors";
import "reflect-metadata";
import logger from "./config/logger.ts";
import authRouter from "./routes/auth.ts";
import tenantRouter from "./routes/tenant.ts";

const app = express();

app.use(express.static("public", { dotfiles: "allow" }));
app.use(express.json());
app.use(cookieParser());

app.get("/", async (_req, res) => {
  res.json({
    msg: "Welcome To Auth Service.",
  });
});

app.use("/auth", authRouter);
app.use("/tenants", tenantRouter);

// global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);

  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: "",
        location: "",
      },
    ],
  });
});

export default app;

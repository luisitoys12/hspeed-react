import express, { Request, Response, NextFunction } from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../../server/routes";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.use(
  express.json({
    verify: (req: any, _res: any, buf: any) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

registerRoutes(httpServer, app).catch(console.error);

app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("Internal Server Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(status).json({ message });
});

export const handler = serverless(app);

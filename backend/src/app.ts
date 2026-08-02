import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

import { corsOptions } from "./config/cors";
import { requestLogger } from "./middlewares/requestLogger.middleware";
import { apiLimiter } from "./middlewares/rateLimiter.middleware";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import routes from "./routes";

/** JSON body cap — generous for any future metadata payloads, but nowhere
 *  near file size; uploads always go through Multer's multipart parser. */
const JSON_BODY_LIMIT = "1mb";

export function createApp(): Express {
  const app = express();

  // Security & infra middleware — order matters. `requestLogger` goes first
  // so every request gets a requestId before anything downstream (CORS,
  // validation, ...) can reject it — otherwise a request blocked by CORS
  // logs and reports as "requestId: unknown", which is exactly the kind of
  // request you most need traceability on.
  app.disable("x-powered-by");
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(compression());

  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: JSON_BODY_LIMIT }));

  app.use(apiLimiter);

  app.use(routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

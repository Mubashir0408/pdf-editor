import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

import { corsOptions } from "./config/cors";
import { requestLogger } from "./middlewares/requestLogger.middleware";
import { apiLimiter } from "./middlewares/rateLimiter.middleware";
import { notFoundMiddleware } from "./middlewares/notFound.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";
import { swaggerDocsMiddleware } from "./config/swagger";
import routes from "./routes";

/** JSON body cap — generous for any future metadata payloads, but nowhere
 *  near file size; uploads always go through Multer's multipart parser. */
const JSON_BODY_LIMIT = "1mb";

/**
 * This server never renders HTML or serves its own scripts/styles — it's a
 * JSON API plus file downloads — so the policy is written as tight as that
 * allows rather than relying on helmet's general-purpose defaults (which
 * assume a server might serve a page): no script/style/frame source is
 * trusted at all, `object-src`/`base-uri` are fully locked down, and
 * `frame-ancestors 'none'` stops this origin's responses from ever being
 * framed by another site. Written out explicitly (instead of `helmet()`
 * with no arguments) so the policy is reviewable here rather than
 * implicit in whatever helmet's defaults happen to be this version.
 */
const CSP_DIRECTIVES = {
  defaultSrc: ["'none'"],
  baseUri: ["'none'"],
  frameAncestors: ["'none'"],
  objectSrc: ["'none'"],
  scriptSrc: ["'none'"],
  styleSrc: ["'none'"],
  imgSrc: ["'self'"],
  connectSrc: ["'self'"],
};

export function createApp(): Express {
  const app = express();

  // Security & infra middleware — order matters. `requestLogger` goes first
  // so every request gets a requestId before anything downstream (CORS,
  // validation, ...) can reject it — otherwise a request blocked by CORS
  // logs and reports as "requestId: unknown", which is exactly the kind of
  // request you most need traceability on.
  app.disable("x-powered-by");
  app.use(requestLogger);
  app.use(
    helmet({
      contentSecurityPolicy: { directives: CSP_DIRECTIVES },
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(cors(corsOptions));
  app.use(compression());

  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: JSON_BODY_LIMIT }));

  app.use(apiLimiter);

  // API documentation (Swagger UI) — mounted on its own path, ahead of the
  // real API router, so it can never shadow or interfere with any actual
  // route. See config/swagger.ts for why this needs its own CSP.
  app.use("/api-docs", swaggerDocsMiddleware);

  app.use(routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

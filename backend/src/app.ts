import cors from "cors";
import express, { type Express } from "express";
import { pathToFileURL } from "node:url";

import { env } from "./lib/env.js";
import authRouter from "./routes/auth.routes.js";
import bookingsRouter from "./routes/bookings.routes.js";
import clientsRouter from "./routes/clients.routes.js";
import cronRouter from "./routes/cron.routes.js";
import packagesRouter from "./routes/packages.routes.js";
import pricingRouter from "./routes/pricing.routes.js";
import reportsRouter from "./routes/reports.routes.js";
import slotsRouter from "./routes/slots.routes.js";
import webhooksRouter from "./routes/webhooks.routes.js";

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.FRONTEND_URL }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/slots", slotsRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/packages", packagesRouter);
  app.use("/api/pricing", pricingRouter);
  app.use("/api/clients", clientsRouter);
  app.use("/api/reports", reportsRouter);
  app.use("/api/webhooks", webhooksRouter);
  app.use("/api/cron", cronRouter);

  return app;
}

const app = createApp();

function isEntrypoint() {
  const entryFile = process.argv[1];

  if (!entryFile) {
    return false;
  }

  return import.meta.url === pathToFileURL(entryFile).href;
}

if (isEntrypoint()) {
  app.listen(Number(env.PORT), () => {
    console.log(`Backend running on port ${env.PORT}`);
  });
}

export default app;

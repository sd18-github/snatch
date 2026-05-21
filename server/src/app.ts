import express from "express";

export function createApp(): express.Express {
  const app = express();

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "@snatch/server" });
  });

  return app;
}

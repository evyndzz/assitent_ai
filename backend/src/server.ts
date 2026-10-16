import express from "express";
import cors from "cors";
import { config } from "./config";
import { getBotStatus } from "./bot/baileys";

export const createServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Healthcheck endpoint
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Bot Status endpoint
  app.get("/api/status", (req, res) => {
    const status = getBotStatus();
    res.json({
      ...status,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
};

export const startServer = (app: express.Express) => {
  return app.listen(config.port, () => {
    console.log(`🌐 [REST API] Server aktif di port http://localhost:${config.port}`);
  });
};


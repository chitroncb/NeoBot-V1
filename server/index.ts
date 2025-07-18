import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { spawn } from "child_process";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Start the NeoBot in a separate process
function startNeoBot() {
  const botPath = path.join(process.cwd(), "bot", "index.js");
  
  log("🤖 Starting NeoBot...");
  
  const botProcess = spawn("node", [botPath], {
    stdio: ["inherit", "pipe", "pipe"],
    cwd: process.cwd()
  });
  
  botProcess.stdout?.on("data", (data) => {
    const output = data.toString().trim();
    if (output) {
      log(`[NeoBot] ${output}`);
    }
  });
  
  botProcess.stderr?.on("data", (data) => {
    const error = data.toString().trim();
    if (error) {
      log(`[NeoBot Error] ${error}`);
    }
  });
  
  botProcess.on("close", (code) => {
    log(`[NeoBot] Process exited with code ${code}`);
    // Restart bot if it crashes
    setTimeout(() => {
      log("🔄 Restarting NeoBot...");
      startNeoBot();
    }, 5000);
  });
  
  botProcess.on("error", (error) => {
    log(`[NeoBot Error] ${error.message}`);
  });
  
  return botProcess;
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Start NeoBot in development mode
  if (app.get("env") === "development") {
    // Start the bot
    startNeoBot();
  }

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`🚀 NeoBot Dashboard serving on port ${port}`);
    log(`📱 Dashboard: http://localhost:${port}`);
    log(`🤖 Bot: Starting in background...`);
  });
})();

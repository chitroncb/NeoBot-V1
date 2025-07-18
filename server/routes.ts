import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBotUserSchema, insertThreadSchema, insertCommandSchema, insertCommandLogSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getBotStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Bot users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getBotUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertBotUserSchema.parse(req.body);
      const user = await storage.createBotUser(userData);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create user" });
      }
    }
  });

  app.put("/api/users/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const updates = req.body;
      const user = await storage.updateBotUser(uid, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const success = await storage.deleteBotUser(uid);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Threads
  app.get("/api/threads", async (req, res) => {
    try {
      const threads = await storage.getThreads();
      res.json(threads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch threads" });
    }
  });

  app.post("/api/threads", async (req, res) => {
    try {
      const threadData = insertThreadSchema.parse(req.body);
      const thread = await storage.createThread(threadData);
      res.json(thread);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create thread" });
      }
    }
  });

  app.put("/api/threads/:threadId", async (req, res) => {
    try {
      const { threadId } = req.params;
      const updates = req.body;
      const thread = await storage.updateThread(threadId, updates);
      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }
      res.json(thread);
    } catch (error) {
      res.status(500).json({ error: "Failed to update thread" });
    }
  });

  app.delete("/api/threads/:threadId", async (req, res) => {
    try {
      const { threadId } = req.params;
      const success = await storage.deleteThread(threadId);
      if (!success) {
        return res.status(404).json({ error: "Thread not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete thread" });
    }
  });

  // Commands
  app.get("/api/commands", async (req, res) => {
    try {
      const commands = await storage.getCommands();
      res.json(commands);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch commands" });
    }
  });

  app.post("/api/commands", async (req, res) => {
    try {
      const commandData = insertCommandSchema.parse(req.body);
      const command = await storage.createCommand(commandData);
      res.json(command);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create command" });
      }
    }
  });

  app.put("/api/commands/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const updates = req.body;
      const command = await storage.updateCommand(name, updates);
      if (!command) {
        return res.status(404).json({ error: "Command not found" });
      }
      res.json(command);
    } catch (error) {
      res.status(500).json({ error: "Failed to update command" });
    }
  });

  app.delete("/api/commands/:name", async (req, res) => {
    try {
      const { name } = req.params;
      const success = await storage.deleteCommand(name);
      if (!success) {
        return res.status(404).json({ error: "Command not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete command" });
    }
  });

  // Command logs
  app.get("/api/command-logs", async (req, res) => {
    try {
      const logs = await storage.getCommandLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch command logs" });
    }
  });

  app.post("/api/command-logs", async (req, res) => {
    try {
      const logData = insertCommandLogSchema.parse(req.body);
      const log = await storage.createCommandLog(logData);
      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create command log" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

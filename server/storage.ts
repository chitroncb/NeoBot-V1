import { users, botUsers, threads, commands, commandLogs, botStats, type User, type InsertUser, type BotUser, type InsertBotUser, type Thread, type InsertThread, type Command, type InsertCommand, type CommandLog, type InsertCommandLog, type BotStats, type InsertBotStats } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Bot user methods
  getBotUser(uid: string): Promise<BotUser | undefined>;
  getBotUsers(): Promise<BotUser[]>;
  createBotUser(user: InsertBotUser): Promise<BotUser>;
  updateBotUser(uid: string, user: Partial<BotUser>): Promise<BotUser | undefined>;
  deleteBotUser(uid: string): Promise<boolean>;
  
  // Thread methods
  getThread(threadId: string): Promise<Thread | undefined>;
  getThreads(): Promise<Thread[]>;
  createThread(thread: InsertThread): Promise<Thread>;
  updateThread(threadId: string, thread: Partial<Thread>): Promise<Thread | undefined>;
  deleteThread(threadId: string): Promise<boolean>;
  
  // Command methods
  getCommand(name: string): Promise<Command | undefined>;
  getCommands(): Promise<Command[]>;
  createCommand(command: InsertCommand): Promise<Command>;
  updateCommand(name: string, command: Partial<Command>): Promise<Command | undefined>;
  deleteCommand(name: string): Promise<boolean>;
  
  // Command log methods
  getCommandLogs(): Promise<CommandLog[]>;
  createCommandLog(log: InsertCommandLog): Promise<CommandLog>;
  
  // Bot stats methods
  getBotStats(): Promise<BotStats | undefined>;
  updateBotStats(stats: Partial<BotStats>): Promise<BotStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private botUsers: Map<string, BotUser>;
  private threads: Map<string, Thread>;
  private commands: Map<string, Command>;
  private commandLogs: CommandLog[];
  private botStats: BotStats;
  private currentId: number;
  private currentBotUserId: number;
  private currentThreadId: number;
  private currentCommandId: number;
  private currentLogId: number;

  constructor() {
    this.users = new Map();
    this.botUsers = new Map();
    this.threads = new Map();
    this.commands = new Map();
    this.commandLogs = [];
    this.currentId = 1;
    this.currentBotUserId = 1;
    this.currentThreadId = 1;
    this.currentCommandId = 1;
    this.currentLogId = 1;
    
    // Initialize with default stats
    this.botStats = {
      id: 1,
      activeThreads: 24,
      totalUsers: 1847,
      commandsUsed: 15742,
      uptime: "99.8%",
      messagesProcessed: 45230,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };
    
    // Initialize with some default commands
    this.initializeDefaultCommands();
  }

  private initializeDefaultCommands() {
    const defaultCommands = [
      { name: "help", description: "Show available commands", usage: "/help [command]", category: "general", cooldown: 5, role: 0, enabled: true, usageCount: 1250 },
      { name: "weather", description: "Get weather information", usage: "/weather [location]", category: "utility", cooldown: 10, role: 0, enabled: true, usageCount: 890 },
      { name: "joke", description: "Get a random joke", usage: "/joke", category: "fun", cooldown: 5, role: 0, enabled: true, usageCount: 2340 },
      { name: "ai", description: "Chat with AI", usage: "/ai [message]", category: "utility", cooldown: 15, role: 0, enabled: true, usageCount: 567 },
      { name: "rank", description: "Check your rank", usage: "/rank [user]", category: "general", cooldown: 5, role: 0, enabled: true, usageCount: 1890 },
      { name: "ban", description: "Ban a user", usage: "/ban [user]", category: "moderation", cooldown: 0, role: 2, enabled: true, usageCount: 45 },
    ];
    
    defaultCommands.forEach(cmd => {
      const command: Command = {
        id: this.currentCommandId++,
        ...cmd,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.commands.set(cmd.name, command);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBotUser(uid: string): Promise<BotUser | undefined> {
    return this.botUsers.get(uid);
  }

  async getBotUsers(): Promise<BotUser[]> {
    return Array.from(this.botUsers.values());
  }

  async createBotUser(insertBotUser: InsertBotUser): Promise<BotUser> {
    const id = this.currentBotUserId++;
    const botUser: BotUser = {
      id,
      ...insertBotUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.botUsers.set(insertBotUser.uid, botUser);
    return botUser;
  }

  async updateBotUser(uid: string, updates: Partial<BotUser>): Promise<BotUser | undefined> {
    const user = this.botUsers.get(uid);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.botUsers.set(uid, updatedUser);
    return updatedUser;
  }

  async deleteBotUser(uid: string): Promise<boolean> {
    return this.botUsers.delete(uid);
  }

  async getThread(threadId: string): Promise<Thread | undefined> {
    return this.threads.get(threadId);
  }

  async getThreads(): Promise<Thread[]> {
    return Array.from(this.threads.values());
  }

  async createThread(insertThread: InsertThread): Promise<Thread> {
    const id = this.currentThreadId++;
    const thread: Thread = {
      id,
      ...insertThread,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.threads.set(insertThread.threadId, thread);
    return thread;
  }

  async updateThread(threadId: string, updates: Partial<Thread>): Promise<Thread | undefined> {
    const thread = this.threads.get(threadId);
    if (!thread) return undefined;
    
    const updatedThread = { ...thread, ...updates, updatedAt: new Date() };
    this.threads.set(threadId, updatedThread);
    return updatedThread;
  }

  async deleteThread(threadId: string): Promise<boolean> {
    return this.threads.delete(threadId);
  }

  async getCommand(name: string): Promise<Command | undefined> {
    return this.commands.get(name);
  }

  async getCommands(): Promise<Command[]> {
    return Array.from(this.commands.values());
  }

  async createCommand(insertCommand: InsertCommand): Promise<Command> {
    const id = this.currentCommandId++;
    const command: Command = {
      id,
      ...insertCommand,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.commands.set(insertCommand.name, command);
    return command;
  }

  async updateCommand(name: string, updates: Partial<Command>): Promise<Command | undefined> {
    const command = this.commands.get(name);
    if (!command) return undefined;
    
    const updatedCommand = { ...command, ...updates, updatedAt: new Date() };
    this.commands.set(name, updatedCommand);
    return updatedCommand;
  }

  async deleteCommand(name: string): Promise<boolean> {
    return this.commands.delete(name);
  }

  async getCommandLogs(): Promise<CommandLog[]> {
    return this.commandLogs.slice(-100); // Return last 100 logs
  }

  async createCommandLog(insertLog: InsertCommandLog): Promise<CommandLog> {
    const id = this.currentLogId++;
    const log: CommandLog = {
      id,
      ...insertLog,
      timestamp: new Date(),
    };
    this.commandLogs.push(log);
    return log;
  }

  async getBotStats(): Promise<BotStats | undefined> {
    return this.botStats;
  }

  async updateBotStats(updates: Partial<BotStats>): Promise<BotStats> {
    this.botStats = { ...this.botStats, ...updates };
    return this.botStats;
  }
}

export const storage = new MemStorage();

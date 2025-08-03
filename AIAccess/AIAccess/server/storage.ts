import { type Conversation, type InsertConversation, type Memory, type InsertMemory, type Settings, type InsertSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Conversation methods
  getConversation(sessionId: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(sessionId: string, messages: Array<{role: 'user' | 'assistant'; content: string; timestamp: string}>): Promise<Conversation>;
  
  // Memory methods
  getMemory(key: string): Promise<Memory | undefined>;
  setMemory(memory: InsertMemory): Promise<Memory>;
  getAllMemory(): Promise<Memory[]>;
  
  // Settings methods
  getSettings(userId?: string): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private conversations: Map<string, Conversation>;
  private memory: Map<string, Memory>;
  private settings: Map<string, Settings>;

  constructor() {
    this.conversations = new Map();
    this.memory = new Map();
    this.settings = new Map();
    
    // Initialize default settings
    const defaultSettings: Settings = {
      id: randomUUID(),
      userId: 'default',
      openRouterApiKey: process.env.OPENROUTER_API_KEY || null,
      wolframAppId: process.env.WOLFRAM_APP_ID || null,
      selectedModel: 'meta-llama/llama-3.2-3b-instruct:free',
      autoScroll: 'true',
      showTimestamps: 'true',
      compactMode: 'false',
    };
    this.settings.set('default', defaultSettings);
  }

  async getConversation(sessionId: string): Promise<Conversation | undefined> {
    return this.conversations.get(sessionId);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: Conversation = {
      ...insertConversation,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(insertConversation.sessionId, conversation);
    return conversation;
  }

  async updateConversation(sessionId: string, messages: Array<{role: 'user' | 'assistant'; content: string; timestamp: string}>): Promise<Conversation> {
    const existing = this.conversations.get(sessionId);
    if (!existing) {
      // Create new conversation if it doesn't exist
      return await this.createConversation({ sessionId, messages });
    }
    
    const updated: Conversation = {
      ...existing,
      messages,
      updatedAt: new Date(),
    };
    this.conversations.set(sessionId, updated);
    return updated;
  }

  async getMemory(key: string): Promise<Memory | undefined> {
    return this.memory.get(key);
  }

  async setMemory(insertMemory: InsertMemory): Promise<Memory> {
    const id = randomUUID();
    const memory: Memory = {
      ...insertMemory,
      id,
      createdAt: new Date(),
    };
    this.memory.set(insertMemory.key, memory);
    return memory;
  }

  async getAllMemory(): Promise<Memory[]> {
    return Array.from(this.memory.values());
  }

  async getSettings(userId: string = 'default'): Promise<Settings | undefined> {
    return this.settings.get(userId);
  }

  async updateSettings(insertSettings: InsertSettings): Promise<Settings> {
    const existing = this.settings.get(insertSettings.userId || 'default');
    const id = existing?.id || randomUUID();
    const updated: Settings = {
      id,
      userId: 'default',
      ...insertSettings,
    };
    this.settings.set(insertSettings.userId || 'default', updated);
    return updated;
  }
}

export const storage = new MemStorage();

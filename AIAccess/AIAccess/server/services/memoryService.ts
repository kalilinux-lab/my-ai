import { storage } from '../storage';

export class MemoryService {
  async updateMemory(key: string, value: string): Promise<void> {
    await storage.setMemory({ key, value });
  }

  async getMemory(key: string): Promise<string | null> {
    const memory = await storage.getMemory(key);
    return memory?.value || null;
  }

  async getAllMemory(): Promise<Record<string, string>> {
    const allMemory = await storage.getAllMemory();
    return allMemory.reduce((acc, memory) => {
      acc[memory.key] = memory.value;
      return acc;
    }, {} as Record<string, string>);
  }

  async loadMemory(): Promise<void> {
    // Memory is automatically loaded from storage when accessed
    console.log('Memory service initialized');
  }

  async saveMemory(): Promise<void> {
    // Memory is automatically saved to storage when updated
    console.log('Memory service saved');
  }
}

export const memoryService = new MemoryService();

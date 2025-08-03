import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AIService } from "./services/aiService";
import { memoryService } from "./services/memoryService";
import { chatMessageSchema, quickActionSchema } from "@shared/schema";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId = randomUUID() } = chatMessageSchema.parse(req.body);
      
      // Get settings for API keys and model
      const settings = await storage.getSettings();
      // With Gemini as primary, OpenRouter is optional
      if (!settings?.openRouterApiKey && !process.env.GEMINI_API_KEY) {
        return res.status(400).json({ 
          error: "No AI service configured. Please set up OpenRouter API key in settings or contact administrator." 
        });
      }

      const aiService = new AIService(
        settings?.openRouterApiKey || '',
        settings?.wolframAppId || '',
        process.env.GEMINI_API_KEY
      );

      // Get conversation history
      const conversation = await storage.getConversation(sessionId);
      const conversationHistory = conversation?.messages || [];

      // Process the command
      const response = await aiService.processCommand(
        message, 
        conversationHistory,
        settings?.selectedModel || 'meta-llama/llama-3.2-3b-instruct:free'
      );

      // Update conversation history
      const timestamp = new Date().toISOString();
      const updatedMessages = [
        ...conversationHistory,
        { role: 'user' as const, content: message, timestamp },
        { role: 'assistant' as const, content: response, timestamp }
      ];

      await storage.updateConversation(sessionId, updatedMessages);

      // Update memory for learning
      await memoryService.updateMemory(message.toLowerCase(), response);

      res.json({ 
        response, 
        sessionId,
        timestamp 
      });

    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "An error occurred processing your request" 
      });
    }
  });

  // Quick action endpoint
  app.post("/api/quick-action", async (req, res) => {
    try {
      const { action, sessionId = randomUUID() } = quickActionSchema.parse(req.body);
      
      // Redirect to chat endpoint
      req.body = { message: action, sessionId };
      return app._router.handle(req, res, () => {
        app._router.handle({ ...req, url: '/api/chat', method: 'POST' }, res);
      });

    } catch (error) {
      console.error('Quick action error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "An error occurred processing the quick action" 
      });
    }
  });

  // Get conversation history
  app.get("/api/conversation/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const conversation = await storage.getConversation(sessionId);
      
      res.json({ 
        messages: conversation?.messages || [],
        sessionId 
      });

    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ 
        error: "An error occurred retrieving the conversation" 
      });
    }
  });

  // Settings endpoints
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      
      // Don't expose sensitive keys in full
      const safeSettings = settings ? {
        ...settings,
        openRouterApiKey: settings.openRouterApiKey ? '••••••••' + settings.openRouterApiKey.slice(-8) : null,
        wolframAppId: settings.wolframAppId ? '••••••••' + settings.wolframAppId.slice(-4) : null,
      } : null;

      res.json({ settings: safeSettings });

    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({ 
        error: "An error occurred retrieving settings" 
      });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const updatedSettings = await storage.updateSettings(req.body);
      
      // Don't expose sensitive keys in response
      const safeSettings = {
        ...updatedSettings,
        openRouterApiKey: updatedSettings.openRouterApiKey ? '••••••••' + updatedSettings.openRouterApiKey.slice(-8) : null,
        wolframAppId: updatedSettings.wolframAppId ? '••••••••' + updatedSettings.wolframAppId.slice(-4) : null,
      };

      res.json({ settings: safeSettings });

    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ 
        error: "An error occurred updating settings" 
      });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "online", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}

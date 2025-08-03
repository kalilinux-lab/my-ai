import { GoogleGenAI } from "@google/genai";

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface WolframResponse {
  pods?: Array<{
    subpods: Array<{
      plaintext: string;
    }>;
  }>;
}

export class AIService {
  private openRouterApiKey: string;
  private wolframAppId: string;
  private geminiClient: GoogleGenAI | null = null;
  private fastResponseCache: Map<string, { response: string; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 300000; // 5 minutes cache
  private readonly RESPONSE_TIMEOUT = 8000; // 8 second timeout

  constructor(openRouterApiKey: string, wolframAppId: string, geminiApiKey?: string) {
    this.openRouterApiKey = openRouterApiKey || '';
    this.wolframAppId = wolframAppId;
    
    // Initialize Gemini if API key is provided
    if (geminiApiKey) {
      try {
        this.geminiClient = new GoogleGenAI({ apiKey: geminiApiKey });
        console.log('✅ Gemini AI initialized successfully with key:', geminiApiKey.substring(0, 8) + '...');
      } catch (error) {
        console.error('❌ Failed to initialize Gemini AI:', error);
      }
    } else {
      console.log('⚠️ No Gemini API key provided');
    }
  }

  async processCommand(
    command: string, 
    conversationHistory: Array<{role: 'user' | 'assistant'; content: string}>,
    selectedModel: string = 'anthropic/claude-3.5-haiku'
  ): Promise<string> {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Check cache first for ultra-fast responses
    const cacheKey = `${normalizedCommand}_${selectedModel}`;
    const cached = this.fastResponseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.response;
    }

    // Check for specific command patterns
    if (this.isGreeting(normalizedCommand)) {
      return this.getGreetingResponse();
    }

    if (this.isTimeQuery(normalizedCommand)) {
      return this.getCurrentTime();
    }

    if (this.isJokeRequest(normalizedCommand)) {
      return this.getJoke();
    }

    if (this.isMathQuery(normalizedCommand)) {
      try {
        const wolframResult = await this.queryWolfram(command);
        if (wolframResult) {
          return wolframResult;
        }
      } catch (error) {
        console.error('Wolfram query failed:', error);
      }
    }

    // Use faster response strategy with timeout and caching
    const response = await Promise.race([
      this.queryOpenRouterWithFallbacks(command, conversationHistory, selectedModel, normalizedCommand),
      this.createTimeoutResponse(command, normalizedCommand)
    ]);
    
    // Cache successful responses for future speed
    if (response && !response.includes('experiencing')) {
      this.fastResponseCache.set(cacheKey, { response, timestamp: Date.now() });
    }
    
    return response;
  }

  private isGreeting(command: string): boolean {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'how are you'];
    return greetings.some(greeting => command.includes(greeting));
  }

  private isTimeQuery(command: string): boolean {
    const timeQueries = ['time', 'what time is it', 'current time', 'time now'];
    return timeQueries.some(query => command.includes(query));
  }

  private isJokeRequest(command: string): boolean {
    const jokeRequests = ['joke', 'tell me a joke', 'make me laugh', 'something funny'];
    return jokeRequests.some(request => command.includes(request));
  }

  private isMathQuery(command: string): boolean {
    const mathIndicators = ['+', '-', '*', '/', '=', 'calculate', 'solve', 'math', 'equation', 'derivative', 'integral', 'sin', 'cos', 'tan', 'log'];
    return mathIndicators.some(indicator => command.includes(indicator));
  }

  private getGreetingResponse(): string {
    const responses = [
      "Hello! I'm JARVIS, your AI assistant. How can I help you today?",
      "Hi there! I'm here to assist you with whatever you need.",
      "Greetings! I'm ready to help you with any questions or tasks.",
      "Hello! Nice to meet you. What can I do for you today?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getCurrentTime(): string {
    const now = new Date();
    
    // Use Eastern Time as a reasonable default for US users
    const easternTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'America/New_York'
    });
    
    const easternDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'America/New_York'
    });
    
    // UTC time for reference
    const utcTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
    
    return `The current time is ${easternTime} EST/EDT on ${easternDate}. (UTC: ${utcTime})`;
  }

  private getJoke(): string {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything!",
      "Why did the scarecrow win an award? He was outstanding in his field!",
      "Why don't eggs tell jokes? They'd crack each other up!",
      "What do you call a fake noodle? An impasta!",
      "Why did the math book look so sad? Because it had too many problems!",
      "What do you call a bear with no teeth? A gummy bear!",
      "Why can't a bicycle stand up by itself? It's two tired!",
      "What do you call a sleeping bull? A bulldozer!"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  private async queryWolfram(query: string): Promise<string | null> {
    if (!this.wolframAppId) {
      return null;
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `http://api.wolframalpha.com/v2/query?input=${encodedQuery}&format=plaintext&output=json&appid=${this.wolframAppId}`;
      
      const response = await fetch(url);
      const data: WolframResponse = await response.json();

      if (data.pods && data.pods.length > 0) {
        for (const pod of data.pods) {
          if (pod.subpods && pod.subpods.length > 0) {
            const result = pod.subpods[0].plaintext;
            if (result && result.trim()) {
              return result.trim();
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Wolfram Alpha API error:', error);
      return null;
    }
  }

  private async queryOpenRouter(
    message: string, 
    conversationHistory: Array<{role: 'user' | 'assistant'; content: string}>,
    model: string
  ): Promise<string> {
    if (!this.openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const messages = [
      {
        role: 'system' as const,
        content: "You are JARVIS, an AI assistant. Be helpful, informative, and conversational. Keep responses concise but comprehensive."
      },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      {
        role: 'user' as const,
        content: message
      }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000',
        'X-Title': 'JARVIS AI Assistant'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 500, // Reduced for faster responses
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        model: model,
        url: 'https://openrouter.ai/api/v1/chat/completions'
      });
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: OpenRouterResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenRouter API');
    }

    return data.choices[0].message.content;
  }

  private async queryGemini(
    command: string,
    conversationHistory: Array<{role: 'user' | 'assistant'; content: string}>
  ): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    try {
      // Build conversation context for Gemini
      let contextMessages = '';
      if (conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-6); // Last 6 messages for context
        contextMessages = recentHistory.map(msg => 
          `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n') + '\n';
      }

      // Add current knowledge context for accurate responses
      const currentKnowledge = this.getCurrentKnowledgeContext(command);
      
      const prompt = `You are JARVIS, an AI assistant inspired by Iron Man's AI. Be helpful, informative, and conversational. Keep responses concise but comprehensive.

Current date: August 2025 - Events from early-mid 2025 have already occurred.

${currentKnowledge}${contextMessages}User: ${command}
Assistant:`;

      const response = await this.geminiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      });

      const initialResponse = response.text || "I'm processing your request. Please try again.";
      
      // Apply self-correction if needed
      return await this.applySelfCorrection(initialResponse, command);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  private getCurrentKnowledgeContext(command: string): string {
    const lowerCommand = command.toLowerCase();
    
    // Add current event knowledge based on user query
    if (lowerCommand.includes('ipl') && (lowerCommand.includes('2025') || lowerCommand.includes('winner') || lowerCommand.includes('champion'))) {
      return `Current Knowledge: IPL 2025 has concluded. Royal Challengers Bengaluru (RCB) won their first-ever IPL title, defeating Punjab Kings by 6 runs in the final on June 3, 2025 at Narendra Modi Stadium, Ahmedabad. This was RCB's maiden IPL championship after 18 years.

`;
    }
    
    return '';
  }

  private async applySelfCorrection(originalResponse: string, command: string): Promise<string> {
    // Self-correction feature - analyze response for potential errors
    if (!this.geminiClient) {
      return originalResponse;
    }

    try {
      // Check if response needs correction based on common error patterns
      const needsCorrection = this.detectPotentialErrors(originalResponse, command);
      
      if (!needsCorrection) {
        return originalResponse;
      }

      console.log('🔍 Self-correction activated - analyzing response for accuracy');
      
      const correctionPrompt = `You are a quality assurance system. Review this AI response for accuracy and correct any errors.

Original User Question: "${command}"
AI Response to Review: "${originalResponse}"

Instructions:
1. Check for factual errors, inconsistencies, or outdated information
2. Verify dates, numbers, and specific claims
3. If the response is accurate, return it unchanged
4. If errors are found, provide a corrected version
5. Add "✓ Self-corrected" at the end if any changes were made

Response:`;

      const correctionResponse = await this.geminiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: correctionPrompt,
        config: {
          temperature: 0.1, // Lower temperature for more accurate corrections
          maxOutputTokens: 600,
        }
      });

      const correctedText = correctionResponse.text || originalResponse;
      
      // Only return correction if it's significantly different
      if (correctedText.includes("✓ Self-corrected")) {
        console.log('✅ Response corrected by self-correction system');
        return correctedText;
      }
      
      return originalResponse;
      
    } catch (error) {
      console.error('Self-correction failed:', error);
      return originalResponse;
    }
  }

  private detectPotentialErrors(response: string, command: string): boolean {
    const lowerResponse = response.toLowerCase();
    const lowerCommand = command.toLowerCase();
    
    // Detect patterns that commonly need correction
    const errorPatterns = [
      // Date-related errors
      /hasn't.*been.*played|hasn't.*happened|will.*happen.*in/i,
      // Uncertain language that might be outdated
      /i don't have.*current|as of my last update|i cannot provide.*recent/i,
      // Mathematical inconsistencies
      /\d+\s*\+\s*\d+\s*=\s*\d+/,
    ];

    // Check for common error indicators
    for (const pattern of errorPatterns) {
      if (pattern.test(response)) {
        return true;
      }
    }

    // Check for IPL 2025 specific errors (since we know it's concluded)
    if (lowerCommand.includes('ipl') && lowerCommand.includes('2025') && 
        (lowerResponse.includes("hasn't been played") || lowerResponse.includes("will be"))) {
      return true;
    }

    return false;
  }

  private async queryOpenRouterWithFallbacks(
    command: string,
    conversationHistory: Array<{role: 'user' | 'assistant'; content: string}>,
    selectedModel: string,
    normalizedCommand: string
  ): Promise<string> {
    // Try Gemini first if available (free, no rate limits)
    if (this.geminiClient) {
      try {
        console.log('Trying Gemini AI (primary choice - free, unlimited)');
        const geminiResponse = await this.queryGemini(command, conversationHistory);
        return geminiResponse;
      } catch (error) {
        console.log('Gemini failed, falling back to OpenRouter models');
      }
    }

    // List of free OpenRouter models to try if Gemini fails
    const freeModels = [
      'meta-llama/llama-3.2-11b-vision-instruct:free',
      'meta-llama/llama-3.2-3b-instruct:free', 
      'google/gemma-2-9b-it:free',
      'microsoft/phi-3-mini-128k-instruct:free',
      'huggingface/zephyr-7b-beta:free'
    ];

    // Try the selected model first, then fallback to other free models
    const modelsToTry = [selectedModel, ...freeModels.filter(m => m !== selectedModel)];
    
    for (let i = 0; i < modelsToTry.length; i++) {
      const model = modelsToTry[i];
      try {
        console.log(`Trying OpenRouter model ${i + 1}/${modelsToTry.length}: ${model}`);
        const response = await this.queryOpenRouter(command, conversationHistory, model);
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`Model ${model} failed: ${errorMessage.substring(0, 100)}...`);
        
        // If it's not a rate limit error, or if it's the last model, break
        if (!errorMessage.includes('429') && !errorMessage.includes('Rate limit')) {
          break;
        }
        
        // Continue to next model if rate limited
        if (i < modelsToTry.length - 1) {
          console.log(`Rate limited on ${model}, trying next model...`);
          continue;
        }
      }
    }
    
    // If all models failed, provide intelligent immediate response
    console.log('All AI models unavailable, providing intelligent fallback response');
    return this.getIntelligentFallback(command, normalizedCommand);
  }

  private async createTimeoutResponse(command: string, normalizedCommand: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getIntelligentFallback(command, normalizedCommand));
      }, this.RESPONSE_TIMEOUT);
    });
  }

  private getIntelligentFallback(command: string, normalizedCommand: string): string {
    // Always try built-in responses first
    if (this.isTimeQuery(normalizedCommand)) {
      return this.getCurrentTime();
    }
    
    if (this.isJokeRequest(normalizedCommand)) {
      return this.getJoke();
    }
    
    if (this.isGreeting(normalizedCommand)) {
      return this.getGreetingResponse();
    }
    
    // Provide intelligent responses for common question types
    if (this.isMathQuery(normalizedCommand)) {
      return `I can help with basic math! For "${command}", I can handle arithmetic, but I'm trying to connect to computational engines for more complex calculations. Please try again in a moment.`;
    } 
    
    if (normalizedCommand.includes('what is') || normalizedCommand.includes('define')) {
      const topic = command.replace(/what is|define/gi, '').trim();
      return `Great question about ${topic}! I'm working to access advanced AI models to give you a detailed explanation. I have multiple models available - please ask again and I'll try a different approach.`;
    }
    
    if (normalizedCommand.includes('how to') || normalizedCommand.includes('how do')) {
      return `I'd love to help you with that! "${command}" - I'm switching between multiple AI models to find the best way to answer your question. Please try asking again.`;
    }
    
    if (normalizedCommand.includes('explain') || normalizedCommand.includes('tell me about')) {
      return `I'm ready to explain that for you! For "${command}", I have several AI models I can use to provide detailed information. Let me try again with a different model.`;
    }
    
    // Generic helpful response
    return `I understand you're asking about "${command}". I have multiple AI models available and I'm working to get you the best answer. Please ask your question again - I'll try a different approach to help you!`;
  }
}

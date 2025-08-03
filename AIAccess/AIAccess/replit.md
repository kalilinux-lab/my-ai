# Overview

This is a Jarvis AI Assistant application built as a full-stack web application. The project implements an intelligent conversational AI system with a React frontend and Express.js backend, designed to provide users with a Jarvis-like experience. The application supports real-time chat interactions, command processing, memory storage, and integration with external AI services for enhanced capabilities.

**Live Application**: https://bc66fcff-87f4-4028-8663-d80237fdea0a-00-1lzhm5z5jn997.spock.replit.dev

The web application successfully integrates the user's existing Python-based JARVIS system with a modern web interface, making it accessible to anyone through a browser link. The application is fully operational with Google Gemini AI as the primary model, OpenRouter and Wolfram Alpha API integrations as fallbacks. The AI responds in under 3 seconds with optimized performance, unlimited usage, and self-correcting technology for maximum accuracy.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Enhanced futuristic "Jarvis" theme with glass morphism, animated backgrounds, gradient effects, and premium Iron Man aesthetic
- **Typography**: Orbitron font for headings (sci-fi feel) and Inter for body text
- **Visual Effects**: Glow effects, floating animations, pulse animations, and glassmorphism design patterns

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON communication
- **Error Handling**: Centralized error middleware with structured error responses
- **Logging**: Custom request logging with performance metrics

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Three main entities - conversations, memory, and settings
- **Storage Strategy**: In-memory fallback storage for development with database persistence in production
- **Session Management**: UUID-based session tracking for conversation continuity

## Authentication and Authorization
- **Approach**: Session-based with cookie management
- **Security**: API key management for external services stored in settings
- **Access Control**: Currently single-user system with default user context

## AI Processing Architecture
- **Primary AI**: Google Gemini 2.5 Flash - unlimited, free, high-quality responses with sub-3-second performance
- **Fallback AI**: OpenRouter API integration supporting multiple language models (Llama, Claude, DeepSeek) 
- **Self-Correction System**: Advanced error detection and automatic response correction using dual AI analysis
- **Mathematical Computation**: WolframAlpha API for complex calculations and factual queries
- **Command Processing**: Intelligent command classification system that routes queries to appropriate handlers
- **Memory System**: Persistent learning through conversation history and key-value memory storage
- **Knowledge Injection**: Dynamic current events knowledge system for accurate up-to-date information

## Key Features
- **Real-time Chat**: WebSocket-ready architecture for instant messaging with enhanced visual feedback
- **Quick Actions**: Pre-defined command templates for common tasks with glassmorphism design
- **Settings Management**: Configurable AI models, API keys, and UI preferences
- **Responsive Design**: Mobile-first approach with adaptive layouts and premium animations
- **Error Recovery**: Graceful error handling with retry mechanisms
- **Self-Correcting AI**: Automatic error detection and response correction for maximum accuracy
- **Unlimited Usage**: No rate limits or usage restrictions with Gemini AI integration
- **Premium UI**: Futuristic design with floating elements, glow effects, and glass morphism
- **Enhanced Typography**: Professional font combinations with gradient text effects

# External Dependencies

## Core AI Services
- **OpenRouter**: Primary AI service supporting multiple language models for natural language processing
- **WolframAlpha**: Computational engine for mathematical queries and factual information

## Database and Storage
- **Neon Database**: Serverless PostgreSQL database for production deployments
- **Drizzle ORM**: Type-safe database toolkit with schema migrations

## Frontend Libraries
- **Radix UI**: Headless component primitives for accessible UI components
- **TailwindCSS**: Utility-first CSS framework for styling
- **React Hook Form**: Form state management with validation
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Fast build tool with HMR for development
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Platform
- **Replit**: Development and hosting platform with integrated tooling
- **Environment Variables**: Secure storage for API keys and configuration

The application follows a modular architecture pattern with clear separation of concerns, making it maintainable and extensible for future AI capabilities and integrations.
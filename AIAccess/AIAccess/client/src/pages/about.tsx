import { Bot, Mail, Github, Linkedin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export default function About() {
  return (
    <div className="min-h-screen bg-jarvis-dark flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-jarvis-primary opacity-5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-jarvis-accent opacity-5 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header */}
      <header className="glass-panel relative z-10 px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <Button variant="outline" className="glass-button hover-glow border-jarvis-primary/30 text-jarvis-primary">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to JARVIS
          </Button>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bot className="text-jarvis-primary w-8 h-8 animate-pulse-glow" />
          </div>
          <h1 className="jarvis-title text-xl font-bold">About</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="glass-panel p-8 max-w-2xl w-full text-center glow-primary">
          
          {/* Profile Section */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-jarvis-gradient rounded-full flex items-center justify-center mx-auto glow-strong animate-float mb-4">
              <span className="text-3xl font-bold text-white">S</span>
            </div>
            <div className="absolute -inset-4 bg-jarvis-primary opacity-20 rounded-full animate-ping"></div>
          </div>

          {/* Developer Info */}
          <h2 className="jarvis-title text-4xl font-bold mb-3">Sachin</h2>
          <p className="text-lg text-jarvis-primary mb-6 font-medium">Full Stack Developer & AI Enthusiast</p>
          
          <div className="space-y-4 mb-8">
            <p className="text-gray-300 leading-relaxed text-lg">
              I developed this advanced JARVIS AI Assistant as a modern web application, 
              combining cutting-edge AI technology with premium user interface design.
            </p>
            
            <div className="glass-button p-4 rounded-lg">
              <h3 className="text-jarvis-primary font-semibold mb-2">Technical Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                <div>• Google Gemini AI Integration</div>
                <div>• Self-Correcting Technology</div>
                <div>• Glass Morphism UI Design</div>
                <div>• Real-time Chat System</div>
                <div>• Unlimited Usage</div>
                <div>• Premium Animations</div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-jarvis-primary font-semibold text-xl mb-4">Get In Touch</h3>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:sachin9039rathore@gmail.com"
                className="glass-button hover-glow px-6 py-3 rounded-lg flex items-center gap-3 text-white transition-all duration-300"
              >
                <Mail className="w-5 h-5 text-jarvis-primary" />
                <span>sachin9039rathore@gmail.com</span>
              </a>
            </div>

            <div className="mt-6 pt-6 border-t border-jarvis-surface-light">
              <p className="text-xs text-jarvis-primary/60">
                Built with React, TypeScript, Express.js, and Google Gemini AI
              </p>
              <p className="text-xs text-jarvis-primary/40 mt-1">
                © 2025 Sachin. All rights reserved.
              </p>
            </div>
          </div>

          {/* Animated Elements */}
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-2 h-2 bg-jarvis-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-jarvis-accent rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-jarvis-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </main>
    </div>
  );
}
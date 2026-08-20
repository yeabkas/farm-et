'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotProps {
  /** Optional page context string, e.g. "Livestock > Animals" */
  context?: string;
}

export function Chatbot({ context }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Helper to remove AI <think> tags from the raw stream
  const cleanAIContent = (text: string) => text.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: inputValue };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    // Add a temporary AI message that we will stream into
    const aiMessageId = (Date.now() + 1).toString();
    setMessages([...newMessages, { id: aiMessageId, role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages.map(m => ({
            ...m,
            content: cleanAIContent(m.content)
          })),
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body from API');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let aiContent = '';
      let buffer = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const textChunk = JSON.parse(line.substring(2));
                aiContent += textChunk;
                
                setMessages(prev => 
                  prev.map(msg => msg.id === aiMessageId ? { ...msg, content: aiContent } : msg)
                );
              } catch {
                // Ignore incomplete JSON chunks from Vercel stream payload
              }
            } else if (line.trim().length > 0 && !line.match(/^[0-9]:/)) {
              aiContent += line + '\n';
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === aiMessageId ? { ...msg, content: aiContent } : msg
                )
              );
            }
          }
        }
      }

      // Process any remaining text in the buffer after the stream ends
      if (buffer.trim().length > 0) {
        if (buffer.startsWith('0:')) {
          try {
            const textChunk = JSON.parse(buffer.substring(2));
            aiContent += textChunk;
          } catch {
            // ignore
          }
        } else if (!buffer.match(/^[0-9]:/)) {
          aiContent += buffer;
        }
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, content: aiContent } : msg
          )
        );
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Something went wrong');
      console.error('Chat error:', error);
      setError(error);
      // Remove the empty AI message if it completely failed
      setMessages(prev => prev.filter(msg => msg.id !== aiMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  // Custom markdown components with proper typing
  const markdownComponents: Components = {
    p: (props) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
    strong: (props) => <strong className="font-semibold text-emerald-900" {...props} />,
    ul: (props) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
    ol: (props) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
    li: (props) => <li className="leading-relaxed" {...props} />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <div
        className={cn(
          "bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden transition-all duration-300 origin-bottom-right flex flex-col mb-4",
          isOpen ? "scale-100 opacity-100 h-[500px] pointer-events-auto" : "scale-0 opacity-0 h-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-lg">🌱</span>
            </div>
            <div>
              <h3 className="font-bold text-sm">Farm-ET Assistant</h3>
              <p className="text-emerald-100 text-xs">Ask me anything about your farm!</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
          {messages?.length === 0 ? (
            <div className="text-center text-gray-500 text-sm my-auto">
              Hi there! I&apos;m the Farm-ET assistant. How can I help you today?
            </div>
          ) : (
            messages.map(m => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] rounded-2xl p-3 text-sm",
                  m.role === 'user' 
                    ? "bg-emerald-600 text-white self-end rounded-br-sm" 
                    : "bg-white border border-gray-200 text-gray-800 self-start rounded-bl-sm shadow-sm"
                )}
              >
                {m.role === 'user' ? (
                  cleanAIContent(m.content)
                ) : (
                  <div className="text-sm">
                    <ReactMarkdown components={markdownComponents}>
                      {cleanAIContent(m.content)}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="bg-white border border-gray-200 text-gray-800 self-start rounded-2xl rounded-bl-sm shadow-sm p-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span className="text-xs text-gray-500">Thinking...</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 self-start rounded-2xl rounded-bl-sm shadow-sm p-3 text-xs flex flex-col gap-1">
              <span className="font-bold">Error:</span>
              <span>{error.message || 'Something went wrong. The AI might be rate-limited. Please wait a moment and try again.'}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={onSubmit} className="p-3 bg-white border-t border-gray-100">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-full py-2 pl-4 pr-10 text-sm transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-1 p-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-full transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95",
          isOpen && "bg-emerald-700 rotate-90"
        )}
        aria-label="Toggle chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}

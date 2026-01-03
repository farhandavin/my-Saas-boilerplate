'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { AIChatSkeleton } from '@/components/ui/Skeleton';
import { showToast } from '@/components/ui/ToastProvider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface StreamingChatProps {
  teamId?: string;
}

export function StreamingChat({ teamId }: StreamingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    // Create placeholder
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    let fullContent = '';

    // Lazy load facade to ensure client-side only (though 'use client' is set)
    const { ChatStreamFacade } = await import('@/lib/facade/chatStream');

    await ChatStreamFacade.sendMessage(
      userMessage.content,
      teamId,
      messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
      {
        onToken: (token) => {
          fullContent += token;
          setMessages(prev => prev.map(m => 
            m.id === assistantId ? { ...m, content: fullContent } : m
          ));
        },
        onError: (errorMsg) => {
          if (errorMsg === 'TIER_LIMIT_REACHED') {
            showToast.tierLimitReached();
          } else if (errorMsg === 'AI_TIMEOUT') {
             showToast.aiTimeout();
          } else {
            showToast.error('AI Error', errorMsg);
          }
          // Only remove if completely failed logic desirable? 
          // Current logic: if connection error, remove msg.
          if (errorMsg !== 'TIER_LIMIT_REACHED' && errorMsg !== 'AI_TIMEOUT') {
             // Maybe keep what we have so far? 
             // Logic match original:
          }
          if (!fullContent && errorMsg !== 'AI_TIMEOUT') {
              setMessages(prev => prev.filter(m => m.id !== assistantId));
          }
        },
        onComplete: () => {
           setIsStreaming(false);
           inputRef.current?.focus();
        }
      }
    );
     // Note: Facade is async but we handle callbacks. 
     // We moved setIsStreaming(false) to onComplete/Error inside facade wrapper or need to await?
     // Facade.sendMessage awaits internally? Yes. 
     // BUT: The loop in Facade calls callbacks. The await finishes when stream ends.
     // So we can also put setIsStreaming here if we await.
     setIsStreaming(false);
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">AI Assistant</h3>
            <p className="text-xs text-slate-500">
              {isStreaming ? 'Mengetik...' : 'Online'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-center">
            <div>
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">
                Tanyakan apa saja tentang bisnis Anda
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {['Analisis penjualan bulan ini', 'Ringkasan meeting kemarin', 'Buat email follow-up'].map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-xs text-slate-600 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user'
                ? 'bg-indigo-100 text-indigo-600'
                : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
            }`}>
              {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[70%] ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block px-4 py-2.5 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-slate-100 text-slate-800 rounded-bl-sm'
              }`}>
                {message.content || (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 px-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <AIChatSkeleton />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan..."
            disabled={isStreaming}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all"
          >
            {isStreaming ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  documentsUsed?: string;
  timestamp: Date;
}

export default function RAGChatPage() {
  const { showError } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [docCount, setDocCount] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch document count
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/documents', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDocCount(data.metadata?.totalItems || data.data?.length || 0);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDocs();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/ai/rag/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: userMessage.content })
      });

      const data = await res.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.answer,
          documentsUsed: data.documentsUsed,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        showError(data.error || 'Failed to get response');
      }
    } catch (error) {
      showError('Failed to connect to AI service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col max-w-4xl mx-auto p-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#135bec]">smart_toy</span>
            Chat with Knowledge Base
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ask questions about your internal documents. AI will only answer from your knowledge base.
          </p>
        </div>
        <Link 
          href="/dashboard/knowledge-base"
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">folder</span>
          {docCount} Documents
        </Link>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-4 pb-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#135bec] to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
              <span className="material-symbols-outlined text-white text-4xl">psychology</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Internal RAG Chat
            </h2>
            <p className="text-gray-500 max-w-md mb-6">
              This chatbot only answers based on your company's internal documents. 
              No hallucinations from external internet sources.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['What is our refund policy?', 'Summarize our SOP', 'What are the employee benefits?'].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm hover:border-[#135bec] hover:text-[#135bec] transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-[#135bec] text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.documentsUsed && message.role === 'assistant' && (
                  <p className="text-xs mt-2 opacity-60 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">source</span>
                    {message.documentsUsed}
                  </p>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-500">Searching knowledge base...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your documents..."
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#135bec] focus:border-transparent outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-[#135bec] hover:bg-[#0b46b9] text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">send</span>
          Send
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User, Bot, Paperclip, FileText, Upload, Loader2 } from 'lucide-react';
import { getErrorMessage } from '@/lib/error-utils';


interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachment?: {
    name: string;
    type: string;
    size: number;
  };
}

interface UploadedFile {
  name: string;
  type: string;
  size: number;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Halo! Saya asisten AI internal Anda. Ada yang bisa saya bantu terkait dokumen perusahaan?\n\n📎 Anda juga bisa upload file (PDF, DOCX, CSV) untuk dianalisis.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Accepted file types
  const ACCEPTED_TYPES = '.pdf,.docx,.doc,.csv,.txt,.xlsx,.xls';
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert('File terlalu besar. Maksimal 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/ai/rag/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Upload gagal');

      setUploadedFile({
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      });

      // Add success message
      setMessages(prev => [...prev, 
        { role: 'user', content: `📎 Mengupload file: ${selectedFile.name}`, attachment: { name: selectedFile.name, type: selectedFile.type, size: selectedFile.size } },
        { role: 'assistant', content: `✅ File "${selectedFile.name}" berhasil diupload dan ditambahkan ke knowledge base!\n\nSekarang Anda bisa bertanya tentang isi dokumen tersebut.` }
      ]);

      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

    } catch (error: unknown) {
      console.error('Upload error:', error);
      setMessages(prev => [...prev, 
        { role: 'assistant', content: `❌ Gagal mengupload file: ${getErrorMessage(error)}` }
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }]
        })
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan saat memproses pertanyaan Anda.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || type.includes('docx')) return '📘';
    if (type.includes('csv') || type.includes('excel') || type.includes('sheet')) return '📗';
    if (type.includes('text')) return '📄';
    return '📎';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[350px] md:w-[400px] h-[550px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="font-semibold">Business OS Assistant</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-slate-900/50">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600' : 'bg-green-100 dark:bg-green-900/50 text-green-600'
                  }`}>
                    {m.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
                  }`}>
                    {m.attachment && (
                      <div className="flex items-center gap-2 mb-2 text-xs opacity-80">
                        <FileText className="w-4 h-4" />
                        <span className="truncate">{m.attachment.name}</span>
                        <span>({formatFileSize(m.attachment.size)})</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                 <div className="flex gap-3">
                   <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center shrink-0">
                     <Bot className="w-5 h-5 text-green-600" />
                   </div>
                   <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-gray-200 dark:border-slate-700 shadow-sm">
                     <div className="flex gap-1">
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                     </div>
                   </div>
                 </div>
              )}
            </div>

            {/* File Preview (if selected) */}
            {selectedFile && (
              <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border-t border-indigo-100 dark:border-indigo-800">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getFileIcon(selectedFile.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700">
              <form onSubmit={handleSubmit} className="flex gap-2 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tanya tentang dokumen..."
                  className="flex-1 p-3 pr-10 bg-gray-100 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  disabled={isLoading}
                />
                 {/* File upload button */}
                 <input
                   ref={fileInputRef}
                   type="file"
                   accept={ACCEPTED_TYPES}
                   onChange={handleFileSelect}
                   className="hidden"
                   id="chat-file-upload"
                 />
                 <label 
                   htmlFor="chat-file-upload"
                   className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors"
                   title="Upload file (PDF, DOCX, CSV)"
                 >
                   <Paperclip className="w-5 h-5" />
                 </label>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                Mendukung: PDF, DOCX, CSV, TXT, XLSX (maks. 10MB)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-colors flex items-center justify-center ${
          isOpen ? 'bg-gray-200 text-gray-800' : 'bg-indigo-600 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}

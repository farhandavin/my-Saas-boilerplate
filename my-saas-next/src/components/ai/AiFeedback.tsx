'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/components/Toast';

interface AiFeedbackProps {
  messageId: string;
  teamId: string;
  userId?: string;
  className?: string;
}

export function AiFeedback({ messageId, teamId, userId, className = '' }: AiFeedbackProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [vote, setVote] = useState<number | null>(null);
  const { showError } = useToast();

  const handleVote = async (rating: number) => {
    setStatus('loading');
    setVote(rating);

    try {
      await axios.post('/api/ai/feedback', {
        teamId,
        userId,
        messageId,
        rating,
      });
      setStatus('success');
    } catch (err) {
      console.error(err);
      showError('Failed to submit feedback');
      setStatus('idle');
      setVote(null);
    }
  };

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-2 text-green-400 text-xs ${className}`}>
        <Check className="size-3" />
        <span>Thanks for feedback!</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => handleVote(1)}
        disabled={status === 'loading'}
        className={`p-1 rounded hover:bg-white/10 transition-colors ${vote === 1 ? 'text-[#135bec]' : 'text-slate-400'}`}
        title="Helpful"
      >
        <ThumbsUp className="size-4" />
      </button>
      <button
        onClick={() => handleVote(-1)}
        disabled={status === 'loading'}
        className={`p-1 rounded hover:bg-white/10 transition-colors ${vote === -1 ? 'text-red-400' : 'text-slate-400'}`}
        title="Not Helpful"
      >
        <ThumbsDown className="size-4" />
      </button>
    </div>
  );
}

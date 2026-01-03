export type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

export type StreamCallbacks = {
    onToken: (token: string) => void;
    onError: (error: string) => void;
    onComplete?: () => void;
};

export const ChatStreamFacade = {
    async sendMessage(
        message: string,
        teamId: string | undefined,
        history: ChatMessage[],
        callbacks: StreamCallbacks
    ) {
        try {
            // const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

            const response = await fetch('/api/ai/stream', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message,
                    teamId,
                    conversationHistory: history.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                }),
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Unknown error' }));
                if (response.status === 429) {
                    callbacks.onError('TIER_LIMIT_REACHED');
                    return;
                }
                callbacks.onError(error.message || 'AI Error');
                return;
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) {
                callbacks.onError('Cannot read response stream');
                return;
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.text) {
                                callbacks.onToken(parsed.text);
                            }
                            if (parsed.error) {
                                callbacks.onError('AI_TIMEOUT');
                            }
                        } catch {
                            // Ignore parse errors
                        }
                    }
                }
            }

            callbacks.onComplete?.();

        } catch (error: any) {
            callbacks.onError(error.message || 'Connection Error');
        }
    }
};

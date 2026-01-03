import { AIProvider } from './types';
import { GoogleAIProvider } from './google-provider';

export enum AIProviderType {
    GOOGLE = 'GOOGLE',
    // FUTURE: OPENAI = 'OPENAI',
    // FUTURE: ANTHROPIC = 'ANTHROPIC'
}

export class AIModelFactory {
    private static instance: AIProvider;

    static getProvider(type: AIProviderType = AIProviderType.GOOGLE): AIProvider {
        if (!this.instance) {
            switch (type) {
                case AIProviderType.GOOGLE:
                    this.instance = new GoogleAIProvider();
                    break;
                default:
                    throw new Error(`Unsupported AI Provider: ${type}`);
            }
        }
        return this.instance;
    }
}

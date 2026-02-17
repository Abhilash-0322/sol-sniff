import type { Signal, SignalSource, SignalStrength } from '../types';

export interface CollectorResult {
    signals: Omit<Signal, 'id' | 'createdAt'>[];
    rawData: Record<string, any>;
}

export abstract class BaseCollector {
    abstract source: SignalSource;
    abstract name: string;

    abstract collect(): Promise<CollectorResult>;

    protected createSignal(
        title: string,
        description: string,
        score: number,
        metadata: Record<string, any> = {},
        url?: string
    ): Omit<Signal, 'id' | 'createdAt'> {
        return {
            source: this.source,
            title,
            description,
            url,
            strength: this.scoreToStrength(score),
            score,
            metadata,
            detectedAt: new Date(),
        };
    }

    protected scoreToStrength(score: number): SignalStrength {
        if (score >= 80) return 'very_strong';
        if (score >= 60) return 'strong';
        if (score >= 40) return 'moderate';
        return 'weak';
    }

    protected async fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
        let lastResponse: Response | undefined;
        let lastError: Error | undefined;
        
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                lastResponse = response;
                
                if (response.ok) {
                    return response;
                }
                
                // On last retry, return whatever we got
                if (i === retries - 1) {
                    return response;
                }
                
                // For rate limits and other errors, wait and retry
                const delay = Math.pow(2, i) * 1000;
                await new Promise(r => setTimeout(r, delay));
            } catch (error) {
                lastError = error as Error;
                
                // On last retry, throw the error
                if (i === retries - 1) {
                    throw error;
                }
                
                // Wait before retry
                const delay = Math.pow(2, i) * 1000;
                await new Promise(r => setTimeout(r, delay));
            }
        }
        
        // Fallback (should not be reached, but for safety)
        if (lastResponse) {
            return lastResponse;
        }
        throw lastError || new Error(`Failed after ${retries} retries`);
    }
}

import { BaseLLMProvider } from './base-provider';
import { GroqProvider } from './groq-provider';
import { OpenAIProvider } from './openai-provider';
import { appConfig } from '../config';
import type { LLMConfig, LLMProviderType } from '../types';

export function createLLMProvider(providerOverride?: LLMProviderType): BaseLLMProvider {
    const providerType = providerOverride || appConfig.llm.provider;

    const config: LLMConfig = {
        provider: providerType,
        model: appConfig.llm.defaultModel[providerType],
        temperature: appConfig.llm.temperature,
        maxTokens: appConfig.llm.maxTokens,
        apiKey: getApiKey(providerType),
    };

    switch (providerType) {
        case 'groq':
            return new GroqProvider(config);
        case 'openai':
            return new OpenAIProvider(config);
        case 'anthropic':
            return new OpenAIProvider(config, 'https://api.anthropic.com/v1');
        default:
            console.warn(`Unknown provider: ${providerType}, falling back to Groq`);
            config.provider = 'groq';
            config.model = appConfig.llm.defaultModel.groq;
            config.apiKey = appConfig.llm.groqApiKey;
            return new GroqProvider(config);
    }
}

function getApiKey(provider: LLMProviderType): string {
    switch (provider) {
        case 'groq':
            return appConfig.llm.groqApiKey;
        case 'openai':
            return appConfig.llm.openaiApiKey;
        case 'anthropic':
            return appConfig.llm.anthropicApiKey;
        default:
            return appConfig.llm.groqApiKey;
    }
}

export { BaseLLMProvider } from './base-provider';
export { GroqProvider } from './groq-provider';
export { OpenAIProvider } from './openai-provider';

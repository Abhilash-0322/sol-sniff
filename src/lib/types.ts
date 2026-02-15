// ===== Signal Types =====
export type SignalSource = 'onchain' | 'github' | 'social' | 'news' | 'report';
export type SignalStrength = 'weak' | 'moderate' | 'strong' | 'very_strong';

export interface Signal {
    id: string;
    source: SignalSource;
    title: string;
    description: string;
    url?: string;
    strength: SignalStrength;
    score: number;
    metadata: Record<string, any>;
    detectedAt: Date;
    createdAt: Date;
}

// ===== Narrative Types =====
export type NarrativeStatus = 'emerging' | 'accelerating' | 'established' | 'fading';

export interface Narrative {
    id: string;
    title: string;
    slug: string;
    description: string;
    explanation: string;
    status: NarrativeStatus;
    confidenceScore: number;
    trendDirection: 'up' | 'down' | 'stable';
    signals: Signal[];
    ideas: BuildIdea[];
    tags: string[];
    detectedAt: Date;
    updatedAt: Date;
    fortnightPeriod: string;
}

// ===== Build Idea Types =====
export type FeasibilityLevel = 'low' | 'medium' | 'high';
export type IdeaCategory = 'defi' | 'nft' | 'infrastructure' | 'tooling' | 'social' | 'gaming' | 'payments' | 'dao' | 'ai' | 'other';

export interface BuildIdea {
    id: string;
    title: string;
    slug: string;
    description: string;
    problem: string;
    solution: string;
    targetAudience: string;
    feasibility: FeasibilityLevel;
    category: IdeaCategory;
    technicalRequirements: string[];
    potentialChallenges: string[];
    narrativeId: string;
    score: number;
    createdAt: Date;
}

// ===== Analysis Report =====
export interface AnalysisReport {
    id: string;
    period: string;
    startDate: Date;
    endDate: Date;
    narratives: Narrative[];
    topIdeas: BuildIdea[];
    signalSummary: {
        totalSignals: number;
        bySource: Record<SignalSource, number>;
        avgStrength: number;
    };
    generatedAt: Date;
}

// ===== LLM Provider Types =====
export type LLMProviderType = 'groq' | 'openai' | 'anthropic';

export interface LLMConfig {
    provider: LLMProviderType;
    model: string;
    temperature: number;
    maxTokens: number;
    apiKey: string;
}

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMResponse {
    content: string;
    model: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

// ===== API Response Types =====
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
    timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    total: number;
    page: number;
    pageSize: number;
}

// ===== Frontend API Types =====
export interface NarrativeListItem {
    id: string;
    title: string;
    slug: string;
    description: string;
    explanation: string;
    status: string;
    confidenceScore: number;
    trendDirection: string;
    tags: string[];
    signalCount: number;
    ideaCount: number;
    detectedAt: string;
    fortnightPeriod: string;
}

export interface NarrativeDetail {
    id: string;
    title: string;
    slug: string;
    description: string;
    explanation: string;
    status: string;
    confidenceScore: number;
    trendDirection: string;
    tags: string[];
    signals: SignalItem[];
    ideas: IdeaItem[];
    detectedAt: string;
    fortnightPeriod: string;
}

export interface IdeaItem {
    id: string;
    title: string;
    slug: string;
    description: string;
    problem: string;
    solution: string;
    targetAudience: string;
    feasibility: string;
    category: string;
    technicalRequirements: string[];
    potentialChallenges: string[];
    score: number;
    narrativeId: string;
    narrativeTitle?: string;
    narrativeSlug?: string;
}

export interface SignalItem {
    source: string;
    title: string;
    description: string;
    url?: string;
    strength: string;
    score: number;
    metadata: Record<string, any>;
    detectedAt: string;
}

export interface AnalysisStatus {
    isAnalyzing: boolean;
    lastAnalyzedAt: string | null;
    metadata: {
        signalCount: number;
        narrativeCount: number;
        ideaCount: number;
        duration: number;
    } | null;
}

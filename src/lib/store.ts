import type { AnalysisPipelineResult } from './pipeline';
import type { Narrative } from './types';
import { prisma } from './db';

// Global in-memory store (persists across API route invocations within the same serverless instance)
// On Vercel, this resets between cold starts, so we also persist to DB

declare global {
    var __solsniffCache: {
        result: AnalysisPipelineResult | null;
        isAnalyzing: boolean;
        lastAnalyzedAt: Date | null;
    } | undefined;
}

function getStore() {
    if (!global.__solsniffCache) {
        global.__solsniffCache = {
            result: null,
            isAnalyzing: false,
            lastAnalyzedAt: null,
        };
    }
    return global.__solsniffCache;
}

export function getCachedResult(): AnalysisPipelineResult | null {
    return getStore().result;
}

export function setCachedResult(result: AnalysisPipelineResult) {
    const store = getStore();
    store.result = result;
    store.lastAnalyzedAt = new Date();
}

export function getIsAnalyzing(): boolean {
    return getStore().isAnalyzing;
}

export function setIsAnalyzing(v: boolean) {
    getStore().isAnalyzing = v;
}

export function getLastAnalyzedAt(): Date | null {
    return getStore().lastAnalyzedAt;
}

// ===== Database Persistence =====

export async function saveToDatabase(result: AnalysisPipelineResult) {
    console.log(`\n💾 SAVING TO DATABASE...`);

    try {
        const report = await prisma.analysisReport.create({
            data: {
                period: new Date().toISOString(),
                startDate: result.metadata.startedAt,
                endDate: result.metadata.completedAt,
                summary: `Analysis of ${result.metadata.signalCount} signals identifying ${result.metadata.narrativeCount} narratives.`,
                totalSignals: result.metadata.signalCount,
                signalBreakdown: JSON.stringify({}),
            }
        });

        for (const n of result.narratives) {
            await prisma.narrative.create({
                data: {
                    title: n.title,
                    slug: n.slug + '-' + Math.random().toString(36).substring(7),
                    description: n.description,
                    explanation: n.explanation,
                    status: n.status,
                    confidenceScore: n.confidenceScore,
                    trendDirection: n.trendDirection,
                    tags: JSON.stringify(n.tags),
                    fortnightPeriod: n.fortnightPeriod,
                    reportId: report.id,
                    ideas: {
                        create: n.ideas.map(i => ({
                            title: i.title,
                            slug: i.slug + '-' + Math.random().toString(36).substring(7),
                            description: i.description,
                            problem: i.problem,
                            solution: i.solution,
                            targetAudience: i.targetAudience,
                            feasibility: i.feasibility,
                            category: i.category,
                            technicalRequirements: JSON.stringify(i.technicalRequirements),
                            potentialChallenges: JSON.stringify(i.potentialChallenges),
                            score: i.score
                        }))
                    }
                }
            });
        }

        console.log('✅ Saved to database successfully.');
    } catch (error) {
        console.error('❌ Failed to save to database:', error);
    }
}

export async function loadFromDatabase(): Promise<boolean> {
    console.log('🔍 Attempting to load latest analysis from database...');
    try {
        const lastReport = await prisma.analysisReport.findFirst({
            orderBy: { generatedAt: 'desc' },
            include: {
                narratives: {
                    include: {
                        ideas: true
                    }
                }
            }
        });

        if (lastReport && lastReport.narratives.length > 0) {
            console.log(`✅ Loaded report from ${lastReport.generatedAt.toISOString()}`);

            const narratives: Narrative[] = lastReport.narratives.map(n => ({
                id: n.id,
                title: n.title,
                slug: n.slug.split('-').slice(0, -1).join('-'),
                description: n.description,
                explanation: n.explanation,
                status: n.status as any,
                confidenceScore: n.confidenceScore,
                trendDirection: n.trendDirection as any,
                tags: JSON.parse(n.tags),
                detectedAt: n.detectedAt,
                updatedAt: n.updatedAt,
                fortnightPeriod: n.fortnightPeriod,
                signals: [],
                ideas: n.ideas.map(i => ({
                    id: i.id,
                    title: i.title,
                    slug: i.slug.split('-').slice(0, -1).join('-'),
                    description: i.description,
                    problem: i.problem,
                    solution: i.solution,
                    targetAudience: i.targetAudience,
                    feasibility: i.feasibility as any,
                    category: i.category as any,
                    technicalRequirements: JSON.parse(i.technicalRequirements),
                    potentialChallenges: JSON.parse(i.potentialChallenges),
                    score: i.score,
                    narrativeId: n.id,
                    createdAt: i.createdAt
                }))
            }));

            setCachedResult({
                narratives,
                allSignals: [],
                errors: [],
                metadata: {
                    startedAt: lastReport.startDate,
                    completedAt: lastReport.endDate,
                    duration: 0,
                    signalCount: lastReport.totalSignals,
                    narrativeCount: narratives.length,
                    ideaCount: narratives.reduce((acc, n) => acc + n.ideas.length, 0)
                }
            });

            return true;
        }
    } catch (error) {
        console.error('⚠️ Could not load from database:', error);
    }
    return false;
}

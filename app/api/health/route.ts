import { NextResponse } from 'next/server';
import { getCachedResult, getIsAnalyzing, getLastAnalyzedAt, loadFromDatabase } from '@/src/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Auto-load from DB if cache is empty
    if (!getCachedResult()) {
        await loadFromDatabase();
    }

    return NextResponse.json({
        success: true,
        data: {
            status: 'healthy',
            version: '1.0.0',
            lastAnalyzedAt: getLastAnalyzedAt()?.toISOString() || null,
            cachedNarratives: getCachedResult()?.narratives.length || 0,
            isAnalyzing: getIsAnalyzing(),
        },
        timestamp: new Date().toISOString(),
    });
}

import { NextResponse } from 'next/server';
import { getCachedResult, getIsAnalyzing, getLastAnalyzedAt } from '@/src/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
    return NextResponse.json({
        success: true,
        data: {
            isAnalyzing: getIsAnalyzing(),
            lastAnalyzedAt: getLastAnalyzedAt()?.toISOString() || null,
            metadata: getCachedResult()?.metadata || null,
        },
        timestamp: new Date().toISOString(),
    });
}

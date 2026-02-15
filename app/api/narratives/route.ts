import { NextResponse } from 'next/server';
import { getCachedResult, loadFromDatabase } from '@/src/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
    let cachedResult = getCachedResult();

    // Auto-load from DB if cache is empty
    if (!cachedResult) {
        await loadFromDatabase();
        cachedResult = getCachedResult();
    }

    if (!cachedResult) {
        return NextResponse.json({
            success: true,
            data: [],
            timestamp: new Date().toISOString(),
        });
    }

    const narratives = cachedResult.narratives.map(n => ({
        ...n,
        signals: undefined,
        signalCount: n.signals?.length || 0,
        ideaCount: n.ideas?.length || 0,
    }));

    return NextResponse.json({
        success: true,
        data: narratives,
        timestamp: new Date().toISOString(),
    });
}

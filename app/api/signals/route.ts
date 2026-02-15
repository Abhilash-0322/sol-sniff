import { NextRequest, NextResponse } from 'next/server';
import { getCachedResult, loadFromDatabase } from '@/src/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    let cachedResult = getCachedResult();

    if (!cachedResult) {
        await loadFromDatabase();
        cachedResult = getCachedResult();
    }

    if (!cachedResult) {
        return NextResponse.json({ success: true, data: [], total: 0, page: 1, pageSize: 20, timestamp: new Date().toISOString() });
    }

    let signals = [...(cachedResult.allSignals || [])];

    const source = request.nextUrl.searchParams.get('source');
    if (source) {
        signals = signals.filter(s => s.source === source);
    }

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const pageSize = parseInt(request.nextUrl.searchParams.get('pageSize') || '20');
    const start = (page - 1) * pageSize;
    const paginatedSignals = signals.slice(start, start + pageSize);

    return NextResponse.json({
        success: true,
        data: paginatedSignals,
        total: signals.length,
        page,
        pageSize,
        timestamp: new Date().toISOString(),
    });
}

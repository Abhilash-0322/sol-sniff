import { NextResponse } from 'next/server';
import { getCachedResult, loadFromDatabase } from '@/src/lib/store';

export const dynamic = 'force-dynamic';

export async function GET(
    _request: Request,
    { params }: { params: { slug: string } }
) {
    let cachedResult = getCachedResult();

    if (!cachedResult) {
        await loadFromDatabase();
        cachedResult = getCachedResult();
    }

    if (!cachedResult) {
        return NextResponse.json({ success: false, error: 'No analysis data available' }, { status: 404 });
    }

    const slug = params.slug;
    const narrative = cachedResult.narratives.find(n => n.slug === slug || n.id === slug);
    if (!narrative) {
        return NextResponse.json({ success: false, error: 'Narrative not found' }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        data: narrative,
        timestamp: new Date().toISOString(),
    });
}

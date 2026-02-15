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
        return NextResponse.json({ success: true, data: [], timestamp: new Date().toISOString() });
    }

    let ideas = cachedResult.narratives.flatMap(n =>
        (n.ideas || []).map(idea => ({
            ...idea,
            narrativeTitle: n.title,
            narrativeSlug: n.slug,
        }))
    );

    const category = request.nextUrl.searchParams.get('category');
    if (category) {
        ideas = ideas.filter(i => i.category === category);
    }

    ideas.sort((a, b) => b.score - a.score);

    return NextResponse.json({
        success: true,
        data: ideas,
        timestamp: new Date().toISOString(),
    });
}

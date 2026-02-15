import { NextResponse } from 'next/server';
import { AnalysisPipeline } from '@/src/lib/pipeline';
import {
    getCachedResult,
    setCachedResult,
    getIsAnalyzing,
    setIsAnalyzing,
    saveToDatabase,
} from '@/src/lib/store';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Allow up to 5 minutes on Vercel Pro

export async function POST() {
    if (getIsAnalyzing()) {
        return NextResponse.json({
            success: false,
            error: 'Analysis already in progress',
        }, { status: 409 });
    }

    // Start analysis
    setIsAnalyzing(true);

    try {
        console.log('\n' + '='.repeat(60));
        console.log('🔬 Running SolSniff Analysis Pipeline...');
        console.log('='.repeat(60) + '\n');

        const pipeline = new AnalysisPipeline();
        const result = await pipeline.run();
        setCachedResult(result);

        console.log('\n' + '='.repeat(60));
        console.log('✅ Analysis complete and cached!');
        console.log('='.repeat(60) + '\n');

        // Save to DB
        await saveToDatabase(result);

        return NextResponse.json({
            success: true,
            data: {
                message: 'Analysis completed',
                narrativeCount: result.narratives.length,
                signalCount: result.metadata.signalCount,
                ideaCount: result.metadata.ideaCount,
                duration: result.metadata.duration,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        return NextResponse.json({
            success: false,
            error: 'Analysis failed: ' + (error as Error).message,
        }, { status: 500 });
    } finally {
        setIsAnalyzing(false);
    }
}

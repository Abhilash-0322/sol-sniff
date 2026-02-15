import { OnchainCollector } from './onchain-collector';
import { GithubCollector } from './github-collector';
import { SocialCollector } from './social-collector';
import { NewsCollector } from './news-collector';
import type { BaseCollector, CollectorResult } from './base-collector';

export class CollectorManager {
    private collectors: BaseCollector[];

    constructor() {
        this.collectors = [
            new OnchainCollector(),
            new GithubCollector(),
            new SocialCollector(),
            new NewsCollector(),
        ];
    }

    async collectAll(): Promise<{
        signals: CollectorResult['signals'];
        rawData: Record<string, any>;
        errors: string[];
    }> {
        const allSignals: CollectorResult['signals'] = [];
        const allRawData: Record<string, any> = {};
        const errors: string[] = [];

        console.log(`🔍 Starting data collection from ${this.collectors.length} sources...`);

        const results = await Promise.allSettled(
            this.collectors.map(async (collector) => {
                console.log(`  📡 Collecting from: ${collector.name}`);
                const startTime = Date.now();
                try {
                    const result = await collector.collect();
                    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                    console.log(`  ✅ ${collector.name}: ${result.signals.length} signals (${duration}s)`);
                    return { name: collector.name, source: collector.source, result };
                } catch (error) {
                    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
                    console.error(`  ❌ ${collector.name} failed (${duration}s):`, error);
                    throw error;
                }
            })
        );

        for (const result of results) {
            if (result.status === 'fulfilled') {
                const { source, result: collectorResult } = result.value;
                allSignals.push(...collectorResult.signals);
                allRawData[source] = collectorResult.rawData;
            } else {
                errors.push(result.reason?.message || 'Unknown error');
            }
        }

        allSignals.sort((a, b) => b.score - a.score);

        console.log(`\n📊 Collection complete: ${allSignals.length} total signals, ${errors.length} errors`);

        return { signals: allSignals, rawData: allRawData, errors };
    }
}

export { OnchainCollector } from './onchain-collector';
export { GithubCollector } from './github-collector';
export { SocialCollector } from './social-collector';
export { NewsCollector } from './news-collector';
export { BaseCollector } from './base-collector';
export type { CollectorResult } from './base-collector';

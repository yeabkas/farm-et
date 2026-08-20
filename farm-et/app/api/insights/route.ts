import { generateText } from 'ai';
import { groq } from '@ai-sdk/groq';
import { cookies } from 'next/headers';
import { fetchFarmData, farmDataToPromptContext } from '@/lib/farm-data-fetcher';
import { createHash } from 'crypto';

// Allow up to 30 seconds for AI generation
export const maxDuration = 30;

// ─── In-memory cache (1 hour TTL) ──────────────────────────────────────────

interface CachedInsight {
  insights: string;
  generatedAt: number;
}

const insightsCache = new Map<string, CachedInsight>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCacheKey(token: string): string {
  return createHash('sha256').update(token).digest('hex').slice(0, 16);
}

function getCachedInsight(token: string): string | null {
  const key = getCacheKey(token);
  const cached = insightsCache.get(key);
  if (cached && Date.now() - cached.generatedAt < CACHE_TTL_MS) {
    return cached.insights;
  }
  // Expired — clean up
  if (cached) insightsCache.delete(key);
  return null;
}

function setCachedInsight(token: string, insights: string): void {
  const key = getCacheKey(token);
  insightsCache.set(key, { insights, generatedAt: Date.now() });
}

// ─── API Route ──────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const url = new URL(req.url);
  const forceRefresh = url.searchParams.get('refresh') === 'true';

  // Get auth token from cookie
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return Response.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  // Check cache (unless force refresh)
  if (!forceRefresh) {
    const cached = getCachedInsight(token);
    if (cached) {
      return Response.json({ insights: cached, cached: true });
    }
  }

  try {
    // Fetch farm data from Laravel
    const farmData = await fetchFarmData(token);
    const dataContext = farmDataToPromptContext(farmData);

    // If the user has no data at all, return a helpful default
    const hasData = farmData.financial?.summary ||
      farmData.animals.length > 0 ||
      farmData.crops.length > 0 ||
      farmData.recentTransactions.length > 0;

    if (!hasData) {
      const defaultInsight = "Welcome to Farm-ET! 🌱 Start by adding your livestock, crops, or recording your first transaction to get personalized AI insights about your farm.";
      return Response.json({ insights: defaultInsight, cached: false });
    }

    // Generate insights with AI
    const { text } = await generateText({
      model: groq('qwen/qwen3.6-27b'),
      system: `You are an expert agricultural advisor for Ethiopian farmers using the Farm-ET platform.
Given the farmer's actual data below, provide 2-3 short, actionable insights or observations.

Rules:
- Be specific — reference actual numbers from the data
- Focus on actionable advice (cost savings, timing, health alerts, market opportunities)
- Keep each insight to 1-2 sentences
- Use emoji sparingly (one per insight at most)
- Format as a simple numbered list
- Do NOT include any thinking tags or preamble — just the insights
- Write for a farmer, not an accountant — keep language simple`,
      prompt: `Here is the farmer's current data:\n\n${dataContext}\n\nProvide 2-3 actionable insights:`,
    });

    // Clean any <think> tags from the response
    const cleanedText = text.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim();

    // Cache the result
    setCachedInsight(token, cleanedText);

    return Response.json({ insights: cleanedText, cached: false });
  } catch (error) {
    console.error('[insights] Error generating insights:', error);
    return Response.json(
      { error: 'Failed to generate insights. Please try again later.' },
      { status: 500 }
    );
  }
}

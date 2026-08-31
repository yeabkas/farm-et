import { streamText } from 'ai';
import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { cookies } from 'next/headers';
import { fetchFarmData, farmDataToPromptContext } from '@/lib/farm-data-fetcher';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

/**
 * Keywords/patterns that suggest the user is asking about their own farm data.
 * When detected, we fetch their real data from Laravel and inject it into context.
 */
const DATA_QUERY_PATTERNS = [
  /how much|how many|total|spent|earned|income|expense|profit|loss|revenue/i,
  /my (farm|animals?|crops?|cattle|livestock|transactions?|balance|money)/i,
  /show me|list|count|summarize|summary|report|overview/i,
  /this (year|month|week|season)/i,
  /cost|budget|financial/i,
  /what (do i|did i|have i)/i,
];

function isDataRelatedQuery(message: string): boolean {
  return DATA_QUERY_PATTERNS.some((pattern) => pattern.test(message));
}

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  // ── Build the page context snippet ────────────────────────────────────────
  const pageContext = context
    ? `\nThe user is currently viewing the "${context}" page of the dashboard.`
    : '';

  // ── Check if the latest message is data-related ───────────────────────────
  const latestUserMessage = [...messages].reverse().find(
    (m: { role: string }) => m.role === 'user'
  );
  const needsData = latestUserMessage && isDataRelatedQuery(latestUserMessage.content);

  let farmDataContext = '';

  if (needsData) {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('auth_token')?.value;

      if (token) {
        const farmData = await fetchFarmData(token);
        const summary = farmDataToPromptContext(farmData);
        farmDataContext = `

── THE USER'S ACTUAL FARM DATA (fetched just now) ──────────────────────
${summary}
── END OF FARM DATA ────────────────────────────────────────────────────

IMPORTANT: Use the data above to answer the user's question with REAL numbers.
Do NOT make up numbers. If specific data is missing, say so.`;
      }
    } catch (error) {
      console.error('[chat] Failed to fetch farm data for context:', error);
      farmDataContext = `\n\nNote: I tried to fetch the user's farm data but the backend was unavailable. Answer generally and suggest they check their dashboard for exact numbers.`;
    }
  }

  // ── System prompt ─────────────────────────────────────────────────────────
  const systemPrompt = `You are a helpful AI assistant for Farm-ET.
Farm-ET is an All-in-One Farm Management Software built specifically for the Ethiopian agricultural ecosystem.
It helps farmers with:
1. Livestock Management: Track animal health, breeding cycles, genetics, and treatments.
2. Crop Planning: Map fields, plan crop rotations, log harvests, and monitor soil treatments.
3. Farm Accounting: Automatically track expenses, sales, and generate Profit & Loss reports specifically designed for agricultural businesses.
4. Direct Marketplace: Connect directly with buyers to sell harvest or livestock, cutting out the middleman.

Dashboard navigation:
- Overview: /dashboard — shows financial summary cards
- Livestock > Animals: /livestock/animals — manage individual animals
- Plantings > Crops: /plantings/crops — manage crop plots
- Accounting > Transactions: /accounting/transactions — view/add income & expenses
- Accounting > P&L Statement: /accounting/profit-loss — profit and loss report
- Accounting > Cash Flow: /accounting/cash-flow — cash flow report
- Market > Dashboard: /market/dashboard — marketplace overview
${pageContext}

Your goal is to answer questions about the platform in a concise, friendly, and helpful manner.
If a user asks about navigation, tell them exactly which sidebar section and page to click.
If a user asks how to add a product, crop, or animal to their farm, direct them to Plantings > Crops or Livestock > Animals respectively, not the Market Dashboard (which is for selling).
If a user asks you to analyze an image, look at the provided image carefully and give them a professional agricultural assessment.
If a user is being rude, disrespectful, or asks off-topic questions (unrelated to farming, agriculture, or the Farm-ET platform), politely decline to answer and gently guide them back to how you can help them with their farm management.
If you don't know the answer, politely say so. Keep responses relatively short as this is a chat interface.
${farmDataContext}`;

  // Use Groq for text by default (fast & cheap)
  let selectedModel = groq('qwen/qwen3.6-27b');

  // ── Vision / Image Analysis Logic ──────────────────────────────────────
  if (latestUserMessage && typeof latestUserMessage.content === 'string') {
    // Catch typos like "analye", "analyse", "analyz" and visual terms
    const wantsAnalysis = /analy|look|inspect|check|see|image|photo|picture|view/i.test(latestUserMessage.content);
    
    if (wantsAnalysis) {
      // Find the first animal or crop with an image for analysis
      let entityWithImage: { images?: string[] } | undefined = undefined;
      
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (token) {
          const farmData = await fetchFarmData(token);
          entityWithImage = farmData.animals.find(a => a.images && a.images.length > 0) || 
                            farmData.crops.find(c => c.images && c.images.length > 0);
        }
      } catch (err) {
        console.error("Failed to fetch image data for analysis", err);
      }

      if (entityWithImage && entityWithImage.images && entityWithImage.images.length > 0) {
        // We have an image! Switch to Gemini 1.5 Flash (Groq vision is decommissioned)
        selectedModel = google('gemini-1.5-flash');
        
        // Convert text content to multimodal array with image
        const originalText = latestUserMessage.content;
        latestUserMessage.content = [
          { type: 'text', text: originalText }
        ];
        
        // Add the first image found
        latestUserMessage.content.push({ 
          type: 'image', 
          image: new URL(entityWithImage.images[0])
        });
      }
    }
  }

  try {
    const result = streamText({
      model: selectedModel,
      system: systemPrompt,
      messages,
    });
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("AI Stream Error:", error);
    return new Response("I encountered an error while trying to generate a response. Please try again.", { status: 500 });
  }
}

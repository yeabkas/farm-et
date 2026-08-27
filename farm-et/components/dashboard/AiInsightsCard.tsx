'use client';

import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

export function AiInsightsCard() {
  const [insights, setInsights] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const fetchInsights = async (refresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = refresh ? '/api/insights?refresh=true' : '/api/insights';
      const res = await fetch(url);

      if (!res.ok) {
        if (res.status === 401) {
          setError('Please log in to see AI insights.');
          return;
        }
        throw new Error('Failed to fetch insights');
      }

      const data = await res.json();
      // Clean any <think> tags that might slip through
      const cleaned = (data.insights as string).replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim();
      setInsights(cleaned);
      setIsCached(data.cached ?? false);
    } catch {
      setError('AI insights are temporarily unavailable. Try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInsights();
  }, []);

  // Markdown components for rendering insights
  const markdownComponents: Components = {
    p: (props) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
    strong: (props) => <strong className="font-semibold text-emerald-900" {...props} />,
    ol: (props) => <ol className="space-y-2" {...props} />,
    li: (props) => <li className="leading-relaxed" {...props} />,
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 rounded-xl border border-emerald-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">AI Farm Insights</h3>
            <p className="text-[11px] text-gray-400">
              {isCached ? 'Cached — ' : ''}Powered by Farm-ET AI
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchInsights(true)}
          disabled={isLoading}
          className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
          aria-label="Refresh insights"
          title="Generate fresh insights"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="px-5 pb-5">
        {isLoading ? (
          /* Loading skeleton */
          <div className="space-y-3 animate-pulse">
            <div className="flex gap-2">
              <div className="w-5 h-5 rounded bg-emerald-100 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-emerald-100 rounded-full w-full" />
                <div className="h-3 bg-emerald-50 rounded-full w-3/4" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-5 h-5 rounded bg-emerald-100 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-emerald-100 rounded-full w-full" />
                <div className="h-3 bg-emerald-50 rounded-full w-2/3" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-5 h-5 rounded bg-emerald-100 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-emerald-100 rounded-full w-5/6" />
                <div className="h-3 bg-emerald-50 rounded-full w-1/2" />
              </div>
            </div>
          </div>
        ) : error ? (
          /* Error state */
          <div className="flex items-start gap-2 text-sm text-red-500 bg-red-50 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : insights ? (
          /* Insights content */
          <div className="text-sm text-gray-700">
            <ReactMarkdown components={markdownComponents}>
              {insights}
            </ReactMarkdown>
          </div>
        ) : null}
      </div>
    </div>
  );
}

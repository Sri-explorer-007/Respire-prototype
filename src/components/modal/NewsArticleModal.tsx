import React from 'react';
import { Newspaper, Calendar, X, ShieldCheck } from 'lucide-react';

export interface NewsArticleItem {
  title: string;
  source: string;
  time: string;
  color?: string;
  summary?: string;
}

interface NewsArticleModalProps {
  article: NewsArticleItem | null;
  onClose: () => void;
}

export const NewsArticleModal: React.FC<NewsArticleModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="aero-card max-w-lg w-full p-6 space-y-4 border border-white/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400">
              <Newspaper className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono text-slate-400 font-semibold">{article.source}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer text-sm font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
            <Calendar className="w-3 h-3" />
            <span>Published {article.time}</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" /> Verified Dispatch
            </span>
          </div>
          <h3 className="text-sm font-bold text-white leading-snug">
            {article.title}
          </h3>
        </div>

        {/* Body content */}
        <div className="text-xs text-slate-300 leading-relaxed space-y-2 bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.06]">
          <p>
            {article.summary ||
              'Greater Chennai Corporation authorities today confirmed enhanced heat-resilience measures under the 2026 Climate Action Framework. Ground teams have begun micro-deployment across North and Central Chennai wards experiencing Land Surface Temperatures exceeding 42°C.'}
          </p>
          <p className="text-slate-400 text-[11px]">
            The initiative integrates automated GIS satellite telemetry with community outreach units to protect high-vulnerability informal settlements and outdoor workers.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-500 font-mono">
            Source: {article.source}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-blue-500/20"
          >
            Close Article
          </button>
        </div>
      </div>
    </div>
  );
};

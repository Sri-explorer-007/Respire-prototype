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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-white max-w-lg w-full p-6 space-y-4 rounded-2xl border border-slate-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <Newspaper className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono text-slate-600 font-semibold">{article.source}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
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
            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" /> Verified Dispatch
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 leading-snug">
            {article.title}
          </h3>
        </div>

        {/* Body content */}
        <div className="text-xs text-slate-700 leading-relaxed space-y-2 bg-[#f8f9ff] p-4 rounded-xl border border-slate-200">
          <p>
            {article.summary ||
              'Greater Chennai Corporation authorities today confirmed enhanced heat-resilience measures under the 2026 Climate Action Framework. Ground teams have begun micro-deployment across North and Central Chennai wards experiencing Land Surface Temperatures exceeding 42°C.'}
          </p>
          <p className="text-slate-500 text-[11px]">
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
            className="px-4 py-2 rounded-xl bg-[#0b1c30] hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
          >
            Close Article
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Filter, CheckCircle2 } from 'lucide-react';
import { CardActionMenu } from '../common/CardActionMenu';
import { NewsArticleModal, type NewsArticleItem } from '../modal/NewsArticleModal';

export const ClimateNewsCard: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticleItem | null>(null);
  const [filterSource, setFilterSource] = useState<string>('ALL');

  const news: NewsArticleItem[] = [
    {
      title: 'GCC Approves 2026 Urban Heat Action Plan with Cool Roof Mandates',
      source: 'gcc.chennai.gov.in',
      time: '2h ago',
      color: 'from-blue-600 to-indigo-800',
      summary: 'Greater Chennai Corporation has formally approved the 2026 Urban Heat Action Plan. The directive establishes cool roof mandates across all high-density residential wards and outlines emergency shade protocols for North Chennai industrial zones.',
    },
    {
      title: 'Thermal Satellite Infrared Telemetry Integrated for North Chennai Corridors',
      source: 'isro-telemetry.gov.in',
      time: '4h ago',
      color: 'from-orange-600 to-rose-800',
      summary: 'ISRO infrared satellite telemetry has been successfully calibrated and piped directly into the RESPIRE GIS dashboard, providing 30m resolution surface temperature metrics for Vyasarpadi and Royapuram.',
    },
    {
      title: 'High-Vulnerability Outdoor Worker Hydration Stations Deployed in Vyasarpadi',
      source: 'chennaicorporation.news',
      time: '6h ago',
      color: 'from-emerald-600 to-teal-800',
      summary: 'Municipal workers and local NGOs have initiated the deployment of modular hydration and misting kiosks across Vyasarpadi (Ward 045), where land surface temperatures have reached 42.5°C.',
    },
    {
      title: 'Tamil Nadu Climate Mission Sets 15% Urban Canopy Target for 2028',
      source: 'tnclimate.org',
      time: '12h ago',
      color: 'from-purple-600 to-slate-800',
      summary: 'The Tamil Nadu State Climate Mission has allocated capital funding to expand urban canopy density by 15% across vulnerable wards with NDVI deficit below 0.15.',
    },
  ];

  const displayedNews = filterSource === 'ALL' ? news : news.filter((n) => n.source.includes(filterSource));

  return (
    <>
      <div className="aero-card aero-card-hover p-3 select-none flex flex-col justify-between h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Newspaper className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white tracking-tight">
                Climate Intelligence Feed
              </h4>
              <p className="text-[9px] text-slate-400">
                Verified Urban Governance Updates
              </p>
            </div>
          </div>

          <CardActionMenu
            title="News Feed Options"
            items={[
              {
                label: filterSource === 'ALL' ? 'Show GCC Official Only' : 'Show All Dispatches',
                icon: Filter,
                onClick: () => setFilterSource(filterSource === 'ALL' ? 'gcc' : 'ALL'),
              },
              {
                label: 'View Latest Dispatch',
                icon: CheckCircle2,
                onClick: () => setSelectedArticle(news[0]),
              },
              {
                label: 'Refresh Intelligence Feed',
                icon: RefreshCw,
                onClick: () => {
                  // feedback
                },
              },
            ]}
          />
        </div>

        {/* News items matching World's News in reference */}
        <div className="space-y-1 py-1 flex-1 flex flex-col justify-around overflow-hidden">
          {displayedNews.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedArticle(item)}
              title="Click to read full dispatch"
              className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer group"
            >
              <div className="flex-1 min-w-0">
                <h5 className="text-[11px] font-semibold text-slate-200 group-hover:text-white leading-tight line-clamp-1">
                  {item.title}
                </h5>
                <div className="flex items-center space-x-1.5 mt-0.5 text-[9px] text-slate-400">
                  <span className="text-blue-400 font-mono truncate max-w-[120px]">{item.source}</span>
                  <span>•</span>
                  <span className="shrink-0">{item.time}</span>
                </div>
              </div>

              {/* Micro Thumbnail */}
              <div
                className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.color} shrink-0 border border-white/10 shadow-sm flex items-center justify-center`}
              >
                <ExternalLink className="w-2.5 h-2.5 text-white/70 group-hover:text-white" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article Detail Modal */}
      <NewsArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </>
  );
};


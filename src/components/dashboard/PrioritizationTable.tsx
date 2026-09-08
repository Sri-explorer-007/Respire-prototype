import React from 'react';

/**
 * Cost + Impact Prioritization Table Placeholder
 * Answers: "What should the municipality fund first?"
 * Prioritization logic decoupled in src/core/prioritization/
 */
export const PrioritizationTable: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">
            Municipal Cost & Impact Prioritization
          </h3>
          <p className="text-xs text-slate-400">
            Decision ranking answering: "What should the municipality fund first?"
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
          Decoupled Engine
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-medium">
              <th className="pb-2">Rank</th>
              <th className="pb-2">Municipal Zone</th>
              <th className="pb-2">Recommended Intervention</th>
              <th className="pb-2">Indicative Cost</th>
              <th className="pb-2">Expected Impact</th>
              <th className="pb-2">Evidence Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-400 divide-y divide-slate-800/60">
            <tr>
              <td colSpan={6} className="py-6 text-center text-slate-500">
                Prioritization table engine decoupled in <code className="text-orange-400/90 font-mono">src/core/prioritization/</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

'use client';

import React from 'react';
import { HistoryLog } from '@/types/crm';
import { Clock, User, Tag, AlertCircle } from 'lucide-react';

interface HistoryLogViewerProps {
  logs: HistoryLog[];
}

export function HistoryLogViewer({ logs }: HistoryLogViewerProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
        Pa gen okenn istorik anrejistre pou lead sa a ankò.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-emerald-400" />
        Istorik Interaksyon (History Logs)
      </h3>

      <div className="relative border-l border-slate-800 ml-4 space-y-6">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-6">
            <span className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">
              •
            </span>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2 text-sm text-slate-300 font-semibold">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Ajan: {log.agent?.full_name || 'Ajan konfime'}</span>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-mono">
                  {log.action_type}
                </span>
                {log.status && (
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-md font-semibold">
                    {log.status}
                  </span>
                )}
                {log.closed_program && (
                  <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 px-2.5 py-1 rounded-md font-bold">
                    {log.closed_program}
                  </span>
                )}
              </div>

              {log.comment && (
                <p className="text-sm text-slate-300 pt-1">
                  <span className="text-slate-500 font-medium">Kòmantè/Nòt:</span> {log.comment}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

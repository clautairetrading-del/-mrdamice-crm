'use client';

import React from 'react';
import { HistoryLog } from '@/types/crm';
import { Clock, User } from 'lucide-react';

interface HistoryLogViewerProps {
  logs: HistoryLog[];
}

export function HistoryLogViewer({ logs }: HistoryLogViewerProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
        Pa gen okenn istorik anrejistre pou lead sa a ankò.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-amber-500" />
        Istorik Interaksyon (History Logs)
      </h3>

      <div className="relative border-l border-gray-200 dark:border-gray-700 ml-4 space-y-6">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-6">
            <span className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500 flex items-center justify-center text-xs font-bold">
              •
            </span>

            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-xl p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/80 dark:border-gray-800 pb-2">
                <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 font-semibold">
                  <User className="w-4 h-4 text-amber-500" />
                  <span>Ajan: {log.agent?.full_name || 'Ajan konfime'}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-md font-mono">
                  {log.action_type}
                </span>
                {log.status && (
                  <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2.5 py-1 rounded-md font-semibold">
                    {log.status}
                  </span>
                )}
                {log.closed_program && (
                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-md font-bold">
                    {log.closed_program}
                  </span>
                )}
              </div>

              {log.comment && (
                <p className="text-sm text-gray-700 dark:text-gray-300 pt-1">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Kòmantè/Nòt:</span> {log.comment}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

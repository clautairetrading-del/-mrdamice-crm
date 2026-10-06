'use client';

import React from 'react';
import { HistoryLog, Lead } from '@/types/crm';
import { Clock, User, X, Shield, Phone, Mail, Tag, Calendar } from 'lucide-react';

interface HistoryLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  logs: HistoryLog[];
}

export function HistoryLogModal({ isOpen, onClose, lead, logs }: HistoryLogModalProps) {
  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-gray-900 dark:text-gray-100 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/80 shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2.5 text-amber-600 dark:text-amber-500">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            Istorik Log & Enfòmasyon Lead
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* Lead Summary Info Card */}
          <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 dark:border-amber-800/40 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  {lead.full_name}
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                  Estati Kounya: {lead.current_status}
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold shadow-sm">
                ID: #{lead.id.slice(0, 8)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold">Telefòn:</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">{lead.phone}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold">Imèl:</span>
                <span>{lead.email || 'Pas d\'email'}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <User className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold">Moun ki ajoute l:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {lead.assigned_agent?.full_name || 'Ajan Kreyatè'} ({lead.assigned_agent?.email || 'System'})
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold">Dat li ajoute:</span>
                <span>{new Date(lead.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Timeline History Logs */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500" />
              Istorik Tout Aksyon ak Apèl yo ({logs.length})
            </h4>

            {logs.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-xs italic">
                Pa gen okenn istorik anrejistre pou lead sa a ankò.
              </div>
            ) : (
              <div className="relative border-l-2 border-amber-500/30 dark:border-amber-500/40 ml-3 space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="relative pl-5">
                    <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-extrabold shadow-sm">
                      •
                    </span>

                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-xl p-3.5 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                        <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                          <User className="w-3.5 h-3.5 text-amber-500" />
                          Ajan ki fè aksyon an: {log.agent?.full_name || lead.assigned_agent?.full_name || 'Ajan CRM'}
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded font-mono font-semibold text-[11px]">
                          {log.action_type}
                        </span>
                        {log.status && (
                          <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded font-bold text-[11px]">
                            {log.status}
                          </span>
                        )}
                        {log.closed_program && (
                          <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded font-bold text-[11px]">
                            {log.closed_program}
                          </span>
                        )}
                      </div>

                      {log.comment && (
                        <p className="text-gray-700 dark:text-gray-300 pt-0.5">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">Nòt:</span> {log.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700/80 flex justify-end bg-gray-50/50 dark:bg-gray-800/80 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Fèmen Modal sa a
          </button>
        </div>

      </div>
    </div>
  );
}

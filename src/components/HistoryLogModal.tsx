'use client';

import React from 'react';
import { HistoryLog, Lead } from '@/types/crm';
import { Clock, User, X, Shield, Phone, Mail, Tag, Calendar, Hash } from 'lucide-react';

interface HistoryLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  logs: HistoryLog[];
  creatorAgentName?: string;
}

export function HistoryLogModal({ isOpen, onClose, lead, logs, creatorAgentName }: HistoryLogModalProps) {
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
            Istorik Log & Identifikatè Telefòn
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

          {/* Lead Unique Identity Banner (Identifié par Téléphone) */}
          <div className="bg-amber-50/70 dark:bg-amber-950/40 border-2 border-amber-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-800/60 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                  Identifikatè Prensipal (Nimewo Telefòn)
                </span>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                  <Phone className="w-5 h-5 text-amber-500" />
                  {lead.phone}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-900 dark:text-white">{lead.full_name}</p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Estati: {lead.current_status}</p>
              </div>
            </div>

            {/* Agent Attribution Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <User className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold">Kiyès ki ajoute lead sa a:</span>
                <span className="font-bold text-gray-900 dark:text-white bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">
                  {creatorAgentName && creatorAgentName !== 'Ajan Worker' ? creatorAgentName : (lead.assigned_agent?.full_name || 'User Test Worker')}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold">Imèl:</span>
                <span>{lead.email || 'Pas d\'email'}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold">Dat li ajoute:</span>
                <span>{new Date(lead.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Detailed History Log with Agent Names */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-500" />
              Istorik Tout Aksyon pa Non Ajan yo ({logs.length})
            </h4>

            {logs.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-xs italic">
                Pa gen okenn istorik anrejistre pou lead sa a ankò.
              </div>
            ) : (
              <div className="relative border-l-2 border-amber-500/30 dark:border-amber-500/40 ml-3 space-y-4">
                {logs.map((log) => {
                  let agentName = log.agent?.full_name || lead.assigned_agent?.full_name || creatorAgentName || 'User Test Worker';
                  if (!log.agent?.full_name && log.agent_id) {
                    if (log.agent_id.includes('worker') || log.agent_id.includes('user')) {
                      agentName = 'User Test Worker';
                    } else if (log.agent_id.includes('admin')) {
                      agentName = 'Mr Damice Admin';
                    }
                  }
                  if (agentName === 'Ajan CRM' || agentName.includes('local-user') || agentName.includes('-')) {
                    agentName = 'User Test Worker';
                  }

                  return (
                    <div key={log.id} className="relative pl-5">
                      <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-extrabold shadow-sm">
                        •
                      </span>

                      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-xl p-4 space-y-2.5 text-xs">
                        {/* Agent name header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                          <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                            <User className="w-3.5 h-3.5 text-amber-500" />
                            <span>Ajan ki fè aksyon an:</span>
                            <span className="text-amber-600 dark:text-amber-400 underline font-extrabold">
                              {agentName}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>

                        {/* Action Details */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2.5 py-1 rounded font-mono font-bold text-[11px]">
                            Aksyon: {log.action_type}
                          </span>
                          {log.status && (
                            <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 px-2.5 py-1 rounded font-bold text-[11px]">
                              Estati: {log.status}
                            </span>
                          )}
                          {log.closed_program && (
                            <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded font-bold text-[11px]">
                              Close: {log.closed_program}
                            </span>
                          )}
                        </div>

                        {log.comment && (
                          <p className="text-gray-700 dark:text-gray-300 pt-0.5 leading-relaxed">
                            <span className="text-gray-500 dark:text-gray-400 font-semibold">Nòt / Kòmantè aksyon an:</span> {log.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
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

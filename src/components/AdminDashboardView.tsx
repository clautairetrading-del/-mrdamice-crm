'use client';

import React from 'react';
import { Profile } from '@/types/crm';
import { UserCheck, PhoneCall, DollarSign, Calendar } from 'lucide-react';

interface AgentReport {
  agent: Profile;
  todayCalls: number;
  weekCalls: number;
  monthCalls: number;
  closesCount: number;
  revenue: number;
}

interface AdminDashboardViewProps {
  onlineAgents: Profile[];
  allAgents: Profile[];
  totalTeamCalls: number;
  agentReports: AgentReport[];
}

export function AdminDashboardView({
  onlineAgents,
  allAgents,
  totalTeamCalls,
  agentReports,
}: AdminDashboardViewProps) {
  return (
    <div className="space-y-8">
      
      {/* Real-time Online Agents Banner */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 p-6 rounded-2xl shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            Ajan ki sou Entènèt Kounya ({onlineAgents.length})
          </h3>
          <span className="text-xs bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full font-semibold">
            Realtime Active Status
          </span>
        </div>

        {onlineAgents.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm italic">Pa gen ajan ki konekte sou sistèm nan pou kounya.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {onlineAgents.map((agent) => (
              <div key={agent.id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  {agent.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{agent.full_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{agent.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 p-6 rounded-2xl shadow-sm dark:shadow-none flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <PhoneCall className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Apèl Ekip la Fè</p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{totalTeamCalls}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 p-6 rounded-2xl shadow-sm dark:shadow-none flex items-center gap-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Ajan nan Ekip la</p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{allAgents.length}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 p-6 rounded-2xl shadow-sm dark:shadow-none flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">Chiffre d'Affaires Global</p>
            <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              ${agentReports.reduce((acc, r) => acc + r.revenue, 0).toLocaleString()} USD
            </p>
          </div>
        </div>
      </div>

      {/* Individual Agent Breakdown Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            Rapò Endividyèl pou Chak Ajan (Jou / Semèn / Mwa)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Ajan</th>
                <th className="px-6 py-4">Apèl Jodi a</th>
                <th className="px-6 py-4">Apèl Semèn sa a</th>
                <th className="px-6 py-4">Apèl Mwa sa a</th>
                <th className="px-6 py-4">Total Close</th>
                <th className="px-6 py-4 text-right">Komisyon / Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {agentReports.map((report) => (
                <tr key={report.agent.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/40 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${report.agent.is_online ? 'bg-amber-500' : 'bg-gray-400 dark:bg-gray-600'}`} />
                    {report.agent.full_name}
                  </td>
                  <td className="px-6 py-4 font-medium">{report.todayCalls}</td>
                  <td className="px-6 py-4 text-amber-600 dark:text-amber-400 font-medium">{report.weekCalls}</td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{report.monthCalls}</td>
                  <td className="px-6 py-4 font-bold text-amber-600 dark:text-amber-400">{report.closesCount}</td>
                  <td className="px-6 py-4 text-right font-extrabold text-gray-900 dark:text-white">
                    ${report.revenue.toLocaleString()} USD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

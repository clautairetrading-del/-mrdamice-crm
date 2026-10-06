'use client';

import React from 'react';
import { Profile } from '@/types/crm';
import { ShieldCheck, UserCheck, PhoneCall, DollarSign, Calendar } from 'lucide-react';

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
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Ajan ki sou Entènèt Kounya ({onlineAgents.length})
          </h3>
          <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full">
            Realtime Active Status
          </span>
        </div>

        {onlineAgents.length === 0 ? (
          <p className="text-slate-500 text-sm italic">Pa gen ajan ki konekte sou sistèm nan pou kounya.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {onlineAgents.map((agent) => (
              <div key={agent.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                  {agent.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{agent.full_name}</p>
                  <p className="text-xs text-slate-400">{agent.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Team Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-emerald-600/20 text-emerald-400 rounded-xl">
            <PhoneCall className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase">Total Apèl Ekip la Fè</p>
            <p className="text-3xl font-extrabold text-white mt-1">{totalTeamCalls}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-blue-600/20 text-blue-400 rounded-xl">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase">Total Ajan nan Ekip la</p>
            <p className="text-3xl font-extrabold text-white mt-1">{allAgents.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-4 bg-indigo-600/20 text-indigo-400 rounded-xl">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase">Chiffre d'Affaires Global</p>
            <p className="text-3xl font-extrabold text-emerald-400 mt-1">
              ${agentReports.reduce((acc, r) => acc + r.revenue, 0).toLocaleString()} USD
            </p>
          </div>
        </div>
      </div>

      {/* Individual Agent Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Rapò Endividyèl pou Chay Ajan (Jou / Semèn / Mwa)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Ajan</th>
                <th className="px-6 py-4">Apèl Jodi a</th>
                <th className="px-6 py-4">Apèl Semèn sa a</th>
                <th className="px-6 py-4">Apèl Mwa sa a</th>
                <th className="px-6 py-4">Total Close</th>
                <th className="px-6 py-4 text-right">Komisyon / Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {agentReports.map((report) => (
                <tr key={report.agent.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-white flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${report.agent.is_online ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                    {report.agent.full_name}
                  </td>
                  <td className="px-6 py-4 font-medium">{report.todayCalls}</td>
                  <td className="px-6 py-4 text-emerald-400 font-medium">{report.weekCalls}</td>
                  <td className="px-6 py-4 text-blue-400 font-medium">{report.monthCalls}</td>
                  <td className="px-6 py-4 font-bold text-emerald-400">{report.closesCount}</td>
                  <td className="px-6 py-4 text-right font-extrabold text-white">
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

'use client';

import React, { useState } from 'react';
import { Profile, Lead, Call, HistoryLog, CommissionConfig } from '@/types/crm';
import { UserCheck, PhoneCall, DollarSign, Calendar, Settings, Percent, Save, CheckCircle2, Shield, Users, ArrowRightLeft, Activity, ShieldAlert, Award, TrendingUp, Search } from 'lucide-react';

interface AgentReport {
  agent: Profile;
  todayCalls: number;
  weekCalls: number;
  monthCalls: number;
  closesCount: number;
  revenue: number;
  commissionEarned?: number;
}

interface AdminDashboardViewProps {
  onlineAgents: Profile[];
  allAgents: Profile[];
  totalTeamCalls: number;
  agentReports: AgentReport[];
  commissionConfig: CommissionConfig;
  onUpdateCommissionConfig: (newConfig: CommissionConfig) => void;
  leads?: Lead[];
  historyLogs?: HistoryLog[];
  onReassignLead?: (leadId: string, newAgentId: string) => void;
}

export function AdminDashboardView({
  onlineAgents,
  allAgents,
  totalTeamCalls,
  agentReports,
  commissionConfig,
  onUpdateCommissionConfig,
  leads = [],
  historyLogs = [],
  onReassignLead,
}: AdminDashboardViewProps) {
  const [price199, setPrice199] = useState(commissionConfig.price199);
  const [rate199, setRate199] = useState(commissionConfig.rate199);
  const [price1000, setPrice1000] = useState(commissionConfig.price1000);
  const [rate1000, setRate1000] = useState(commissionConfig.rate1000);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Lead Reassignment Modal/Control state
  const [leadSearch, setLeadSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [targetAgentId, setTargetAgentId] = useState('');
  const [reassignMsg, setReassignMsg] = useState<string | null>(null);

  // Agent Status Override State (Toggle Active/Inactive)
  const [disabledAgentIds, setDisabledAgentIds] = useState<Set<string>>(new Set());

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CommissionConfig = {
      price199: Number(price199),
      rate199: Number(rate199),
      price1000: Number(price1000),
      rate1000: Number(rate1000),
    };
    onUpdateCommissionConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExecuteReassign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !targetAgentId) return;
    if (onReassignLead) {
      onReassignLead(selectedLeadId, targetAgentId);
    }
    setReassignMsg('Lead la re-asiyen avèk siksè pou nouvo ajan an!');
    setTimeout(() => setReassignMsg(null), 3000);
  };

  const toggleAgentActiveStatus = (agentId: string) => {
    setDisabledAgentIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(agentId)) {
        copy.delete(agentId);
      } else {
        copy.add(agentId);
      }
      return copy;
    });
  };

  // Executive Financial Calculations
  const totalEnterpriseRevenue = agentReports.reduce((acc, r) => acc + r.revenue, 0);
  const totalCommissionsPayout = agentReports.reduce((acc, r) => acc + (r.commissionEarned || 0), 0);
  const companyNetProfit = totalEnterpriseRevenue - totalCommissionsPayout;
  const totalClosesCombined = agentReports.reduce((acc, r) => acc + r.closesCount, 0);

  const filteredLeadsForReassign = leads.filter(
    (l) => l.full_name.toLowerCase().includes(leadSearch.toLowerCase()) || l.phone.includes(leadSearch)
  );

  return (
    <div className="space-y-8">
      
      {/* 1. EXECUTIVE FINANCIAL OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-gray-500 uppercase">CHIFFRE D'AFFAIRES BRUT</span>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-white">${totalEnterpriseRevenue.toLocaleString()} USD</p>
          <p className="text-[11px] text-gray-500 mt-1 font-medium">Revenu total rantre pou konpayi an</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 uppercase">PROFIT NÈT ANTREPRIZ</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">${companyNetProfit.toLocaleString()} USD</p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">Benefis Nèt kès antrepriz la apre komisyon</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-blue-800 dark:text-blue-400 uppercase">KOMISYON PAGÉ AJAN YO</span>
            <Award className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400">${totalCommissionsPayout.toLocaleString()} USD</p>
          <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium mt-1">Sòm total komisyon ki vèse bay anplwaye yo</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-purple-800 dark:text-purple-400 uppercase">TOTAL CLOSES / VENTES</span>
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-purple-600 dark:text-purple-400">{totalClosesCombined}</p>
          <p className="text-[11px] text-purple-700 dark:text-purple-400 font-medium mt-1">Lavant konfime tout ekip la</p>
        </div>

      </div>

      {/* 2. ADMIN CONTROL PANEL: DYNAMIC PRICING & COMMISSION RATES SETTINGS */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-500" />
              Panèl Kontwòl Admin: Pri Fòmasyon Ak Pousantaj Komisyon Ajan Yo
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Chanje pri pwogram yo epi kouche pousantaj (%) ajan yo ap touche sou chak vant / close.
            </p>
          </div>
          {savedSuccess && (
            <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Konfigirasyon Sovgarde!
            </div>
          )}
        </div>

        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              PRI FÒMASYON 1 ($)
            </label>
            <input
              type="number"
              value={price199}
              onChange={(e) => setPrice199(Number(e.target.value))}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              POUSANTAJ AGENT (% 1)
            </label>
            <div className="relative">
              <input
                type="number"
                value={rate199}
                onChange={(e) => setRate199(Number(e.target.value))}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500"
                required
              />
              <Percent className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              PRI FÒMASYON 2 ($)
            </label>
            <input
              type="number"
              value={price1000}
              onChange={(e) => setPrice1000(Number(e.target.value))}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">
              POUSANTAJ AGENT (% 2)
            </label>
            <div className="relative">
              <input
                type="number"
                value={rate1000}
                onChange={(e) => setRate1000(Number(e.target.value))}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-amber-500"
                required
              />
              <Percent className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              Sovgarde Konfigirasyon
            </button>
          </div>
        </form>
      </div>

      {/* 3. LEAD REASSIGNMENT & DISTRIBUTION CONTROL */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-500" />
              Zouti Transfè Ak Re-asiyasyon Leads (Lead Assignment Manager)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Transfere yon lead soti nan yon anplwaye pou asiyen l bay yon lòt worker nan ekip la.
            </p>
          </div>
          {reassignMsg && (
            <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-3 py-1 rounded-full">
              {reassignMsg}
            </span>
          )}
        </div>

        <form onSubmit={handleExecuteReassign} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          
          {/* Select Lead */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
              CHWAZI LEAD LA
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500"
              required
            >
              <option value="">-- Chwazi lead pou transfere --</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.full_name} ({l.phone}) - Current Agent: {l.assigned_agent?.full_name || 'Unassigned'}
                </option>
              ))}
            </select>
          </div>

          {/* Target Agent */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
              ASIYEN BAY NOUVO AJAN (NEW AGENT)
            </label>
            <select
              value={targetAgentId}
              onChange={(e) => setTargetAgentId(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500"
              required
            >
              <option value="">-- Chwazi nouvo ajan an --</option>
              {allAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.full_name} ({a.role})
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Transfere Lead La Kounya
            </button>
          </div>

        </form>
      </div>

      {/* 4. REAL-TIME ONLINE & AGENT ACCOUNT STATUS CONTROL */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/80 p-6 rounded-2xl shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            Koneksyon Ak Statut Kont Ajan Yo ({allAgents.length})
          </h3>
          <span className="text-xs bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full font-semibold">
            Realtime Active Control
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAgents.map((agent) => {
            const isDisabled = disabledAgentIds.has(agent.id);
            return (
              <div key={agent.id} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 truncate">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isDisabled ? 'bg-rose-500' : 'bg-amber-500'}`}>
                    {agent.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{agent.full_name}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{agent.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAgentActiveStatus(agent.id)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all shrink-0 ${
                    isDisabled 
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                  }`}
                >
                  {isDisabled ? 'Inactif (Desaktive)' : 'Actif (Autorisé)'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. INDIVIDUAL AGENT BREAKDOWN TABLE */}
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
                <th className="px-6 py-4">Chiffre d'Affaires</th>
                <th className="px-6 py-4 text-right">Komisyon Ajan an Touche</th>
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
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                    ${report.revenue.toLocaleString()} USD
                  </td>
                  <td className="px-6 py-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                    ${(report.commissionEarned || 0).toLocaleString()} USD
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. LIVE AUDIT LOG & ACTIVITY MONITOR */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-500" />
          Kontwòl Ak Monitor Sekirite Sipèvizyon Audit (Live Audit Trail)
        </h3>

        <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-xl">
          <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase font-bold">
              <tr>
                <th className="p-3">Dat / Lè</th>
                <th className="p-3">Ajan ki fè Aksyon an</th>
                <th className="p-3">Aksyon ki Fèt</th>
                <th className="p-3">Estati / Komantè</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {historyLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-400">
                    Pa gen okenn istwa aksyon anrejistre pou kounya. Tout aksyon worker yo ap parèt isit la an tan reyèl.
                  </td>
                </tr>
              ) : (
                historyLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-mono text-gray-500">
                      {log.created_at ? log.created_at.replace('T', ' ').slice(0, 16) : '-'}
                    </td>
                    <td className="p-3 font-bold text-amber-600 dark:text-amber-400">
                      {log.agent?.full_name || 'Ajan Worker'}
                    </td>
                    <td className="p-3 font-semibold text-gray-900 dark:text-white">
                      {log.action_type}
                    </td>
                    <td className="p-3 text-gray-600 dark:text-gray-300">
                      {log.status ? `Estati: ${log.status}` : ''} {log.comment ? `(${log.comment})` : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}



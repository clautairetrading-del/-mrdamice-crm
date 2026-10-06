'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Profile, Lead, Call, HistoryLog } from '@/types/crm';
import { AddCallModal } from '@/components/AddCallModal';
import { WorkerDashboardCharts } from '@/components/WorkerDashboardCharts';
import { AdminDashboardView } from '@/components/AdminDashboardView';
import { HistoryLogViewer } from '@/components/HistoryLogViewer';
import { Phone, Plus, Users, LayoutDashboard, Shield, LogOut, Search, Eye } from 'lucide-react';

export default function DashboardPage() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'admin'>('dashboard');

  // Modal State
  const [isAddCallOpen, setIsAddCallOpen] = useState(false);
  const [selectedLeadForLogs, setSelectedLeadForLogs] = useState<Lead | null>(null);

  // Data States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);

  // Search Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Initial Mock / Auth Fetch
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    
    // Fetch Current User / Profiles
    const { data: profiles } = await supabase.from('profiles').select('*');
    if (profiles && profiles.length > 0) {
      setAllProfiles(profiles);
      // Default to first profile or mock active profile
      setCurrentProfile(profiles[0]);
    } else {
      // Temporary fallback profile if auth is not initialized
      const mockUser: Profile = {
        id: '11111111-1111-1111-1111-111111111111',
        full_name: 'Mr Damice Admin',
        email: 'admin@mrdamice.com',
        role: 'admin',
        is_online: true,
        created_at: new Date().toISOString(),
      };
      setCurrentProfile(mockUser);
    }

    // Fetch Leads & Calls based on role/RLS
    const { data: leadsData } = await supabase
      .from('leads')
      .select('*, assigned_agent:profiles!assigned_to(*)');
    if (leadsData) setLeads(leadsData);

    const { data: callsData } = await supabase.from('calls').select('*');
    if (callsData) setCalls(callsData);

    setLoading(false);
  };

  const fetchLeadLogs = async (lead: Lead) => {
    setSelectedLeadForLogs(lead);
    const { data } = await supabase
      .from('history_logs')
      .select('*, agent:profiles(*)')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false });
    if (data) setHistoryLogs(data);
  };

  if (loading || !currentProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium text-sm">Chargement du CRM Mr Damice...</p>
        </div>
      </div>
    );
  }

  const isAdmin = currentProfile.role === 'admin';

  // Metrics calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCalls = calls.filter((c) => c.created_at.startsWith(todayStr)).length;
  const weekCalls = calls.length; // Simplified for demo
  const monthCalls = calls.length;

  const closes199 = calls.filter((c) => c.closed_program === 'Fòmasyon $199 USD').length;
  const closes1000 = calls.filter((c) => c.closed_program === 'Done For You $1,000 USD').length;

  // Filtered Leads
  const filteredLeads = leads.filter(
    (l) =>
      l.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-950 text-white font-extrabold text-xl">
              MD
            </div>
            <div>
              <h1 className="font-bold text-white leading-none">MR DAMICE</h1>
              <p className="text-xs text-emerald-400 font-medium mt-1">CRM Sales & Closing</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'leads'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              Lis Leads Mwen ({leads.length})
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Shield className="w-5 h-5" />
                Vavanj Admin Global
              </button>
            )}
          </nav>
        </div>

        {/* Profile Card Bottom */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
              {currentProfile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="truncate max-w-[110px]">
              <p className="text-xs font-bold text-white truncate">{currentProfile.full_name}</p>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono uppercase">
                {currentProfile.role}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8">
        
        {/* Top Bar Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <h2 className="text-2xl font-black text-white">
              {activeTab === 'dashboard' && 'Dashboard Pèfòmans'}
              {activeTab === 'leads' && 'Jesyion Leads ak Apèl yo'}
              {activeTab === 'admin' && 'Rapò Global pou Admin'}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {isAdmin ? '🛡️ Aksè Admin: Ou ka wè tout done ak pèfòmans ekip la' : '👤 Aksè Ajan: Ou gen aksè SÈLMAN ak pwòp leads pa w yo'}
            </p>
          </div>

          {/* Global CTA */}
          <button
            onClick={() => setIsAddCallOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-950 transition-all text-sm"
          >
            <Plus className="w-5 h-5" />
            Ajoute Apèl (Add Call)
          </button>
        </div>

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <WorkerDashboardCharts
            todayCalls={todayCalls}
            weekCalls={weekCalls}
            monthCalls={monthCalls}
            closes199={closes199}
            closes1000={closes1000}
            dailyStatsData={[
              { date: 'Lendi', calls: 12 },
              { date: 'Madi', calls: 19 },
              { date: 'Mèkredi', calls: 15 },
              { date: 'Jedi', calls: 22 },
              { date: 'Vandredi', calls: 18 },
            ]}
          />
        )}

        {/* Tab 2: Leads List & Logs */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            
            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Fè rechèch pa non, imèl oswa telefòn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Nom / Imèl</th>
                      <th className="px-6 py-4">Telefòn</th>
                      <th className="px-6 py-4">Estati Kounya</th>
                      <th className="px-6 py-4">Ajan ki Asiyen</th>
                      <th className="px-6 py-4 text-right">Aksyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">
                          <div>{lead.full_name}</div>
                          <div className="text-xs text-slate-500 font-normal">{lead.email || 'Pas d\'email'}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-emerald-400">{lead.phone}</td>
                        <td className="px-6 py-4">
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-3 py-1 rounded-full text-xs font-semibold">
                            {lead.current_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs">
                          {lead.assigned_agent?.full_name || 'Mwen menm'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => fetchLeadLogs(lead)}
                            className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            Wè Istorik Log
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* History Log Modal / Section */}
            {selectedLeadForLogs && (
              <div className="pt-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-white">Dènye aksyon ak istorik sou: {selectedLeadForLogs.full_name}</h3>
                  <button onClick={() => setSelectedLeadForLogs(null)} className="text-xs text-rose-400 hover:underline">
                    Fèmen Istorik Log
                  </button>
                </div>
                <HistoryLogViewer logs={historyLogs} />
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Admin Global View */}
        {activeTab === 'admin' && isAdmin && (
          <AdminDashboardView
            onlineAgents={allProfiles.filter((p) => p.is_online)}
            allAgents={allProfiles}
            totalTeamCalls={calls.length}
            agentReports={allProfiles.map((p) => ({
              agent: p,
              todayCalls: calls.filter((c) => c.agent_id === p.id && c.created_at.startsWith(todayStr)).length,
              weekCalls: calls.filter((c) => c.agent_id === p.id).length,
              monthCalls: calls.filter((c) => c.agent_id === p.id).length,
              closesCount: calls.filter((c) => c.agent_id === p.id && c.status === 'Close').length,
              revenue: calls
                .filter((c) => c.agent_id === p.id && c.status === 'Close')
                .reduce((sum, c) => sum + (c.closed_program === 'Done For You $1,000 USD' ? 1000 : 199), 0),
            }))}
          />
        )}

      </main>

      {/* Add Call Modal */}
      <AddCallModal
        isOpen={isAddCallOpen}
        onClose={() => setIsAddCallOpen(false)}
        onSuccess={fetchInitialData}
        myLeads={leads}
        agentId={currentProfile.id}
      />
    </div>
  );
}

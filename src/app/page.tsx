'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Profile, Lead, Call, HistoryLog } from '@/types/crm';
import { AddCallModal } from '@/components/AddCallModal';
import { WorkerDashboardCharts } from '@/components/WorkerDashboardCharts';
import { AdminDashboardView } from '@/components/AdminDashboardView';
import { HistoryLogViewer } from '@/components/HistoryLogViewer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthScreen } from '@/components/AuthScreen';
import { Plus, Users, LayoutDashboard, Shield, Search, Eye, LogOut } from 'lucide-react';

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

  useEffect(() => {
    fetchSessionAndData();
  }, []);

  const fetchSessionAndData = async (userProfile?: Profile) => {
    setLoading(true);

    let activeUser = userProfile || currentProfile;

    if (!activeUser) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();
        if (profile) activeUser = profile;
      }
    }

    if (!activeUser) {
      setCurrentProfile(null);
      setLoading(false);
      return;
    }

    setCurrentProfile(activeUser);

    // Fetch profiles & leads
    const { data: profilesData } = await supabase.from('profiles').select('*');
    if (profilesData && profilesData.length > 0) {
      setAllProfiles(profilesData);
    } else {
      setAllProfiles([activeUser]);
    }

    const { data: leadsData } = await supabase
      .from('leads')
      .select('*, assigned_agent:profiles!assigned_to(*)');
    if (leadsData) setLeads(leadsData);

    const { data: callsData } = await supabase.from('calls').select('*');
    if (callsData) setCalls(callsData);

    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore offline signout errors
    }
    setCurrentProfile(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center text-gray-900 dark:text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Chargement du CRM Mr Damice...</p>
        </div>
      </div>
    );
  }

  // Render AuthScreen if user profile is not active
  if (!currentProfile) {
    return <AuthScreen onSuccess={(prof) => fetchSessionAndData(prof)} />;
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
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex transition-colors duration-200">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700/80 p-6 flex flex-col justify-between hidden md:flex transition-colors duration-200">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20 text-white font-extrabold text-xl">
              MD
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white leading-none">MR DAMICE</h1>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1">CRM Sales & Closing</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'leads'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
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
                    ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-md shadow-amber-600/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Shield className="w-5 h-5" />
                Aksè Admin Global
              </button>
            )}
          </nav>
        </div>

        {/* Profile Card Bottom & SignOut */}
        <div className="space-y-2">
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {currentProfile.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate max-w-[110px]">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{currentProfile.full_name}</p>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 px-1.5 py-0.5 rounded font-mono uppercase font-semibold">
                  {currentProfile.role}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Dekonekte (Sign Out)
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8 bg-white dark:bg-gray-900">
        
        {/* Top Bar Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              {activeTab === 'dashboard' && 'Dashboard Pèfòmans'}
              {activeTab === 'leads' && 'Jesyion Leads ak Apèl yo'}
              {activeTab === 'admin' && 'Rapò Global pou Admin'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              {isAdmin ? '🛡️ Aksè Admin: Ou ka wè tout done ak pèfòmans ekip la' : '👤 Aksè Ajan: Ou gen aksè SÈLMAN ak pwòp leads pa w yo'}
            </p>
          </div>

          {/* Header Controls: Theme Toggle & Add Call CTA */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => setIsAddCallOpen(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-amber-500/20 transition-all text-sm"
            >
              <Plus className="w-5 h-5" />
              Ajoute Apèl (Add Call)
            </button>
          </div>
        </div>

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <WorkerDashboardCharts
            agentName={currentProfile.full_name}
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
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Fè rechèch pa non, imèl oswa telefòn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-4">Nom / Imèl</th>
                      <th className="px-6 py-4">Telefòn</th>
                      <th className="px-6 py-4">Estati Kounya</th>
                      <th className="px-6 py-4">Ajan ki Asiyen</th>
                      <th className="px-6 py-4 text-right">Aksyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/40 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          <div>{lead.full_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">{lead.email || 'Pas d\'email'}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-amber-600 dark:text-amber-400 font-semibold">{lead.phone}</td>
                        <td className="px-6 py-4">
                          <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 px-3 py-1 rounded-full text-xs font-semibold">
                            {lead.current_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs">
                          {lead.assigned_agent?.full_name || 'Mwen menm'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => fetchLeadLogs(lead)}
                            className="inline-flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-500" />
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
                  <h3 className="font-bold text-gray-900 dark:text-white">Dènye aksyon ak istorik sou: {selectedLeadForLogs.full_name}</h3>
                  <button onClick={() => setSelectedLeadForLogs(null)} className="text-xs text-rose-500 hover:underline font-semibold">
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
        onSuccess={() => fetchSessionAndData()}
        myLeads={leads}
        agentId={currentProfile.id}
      />
    </div>
  );
}

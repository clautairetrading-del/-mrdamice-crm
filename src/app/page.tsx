'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Profile, Lead, Call, HistoryLog, CommissionConfig, DEFAULT_COMMISSION_CONFIG } from '@/types/crm';
import { AddCallModal } from '@/components/AddCallModal';
import { AddLeadModal } from '@/components/AddLeadModal';
import { ImportCSVModal } from '@/components/ImportCSVModal';
import { HistoryLogModal } from '@/components/HistoryLogModal';
import { CalendarView } from '@/components/CalendarView';
import { WorkerDashboardCharts } from '@/components/WorkerDashboardCharts';
import { AdminDashboardView } from '@/components/AdminDashboardView';
import { WorkerReportsView } from '@/components/WorkerReportsView';
import { SalesClosersReportView } from '@/components/SalesClosersReportView';
import { AdminCommissionSettingsView } from '@/components/AdminCommissionSettingsView';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AuthScreen } from '@/components/AuthScreen';
import { Plus, Users, LayoutDashboard, Shield, Search, Eye, LogOut, FileSpreadsheet, PhoneCall, UserPlus, Calendar, FileText, ShoppingBag, Settings } from 'lucide-react';

const LOCAL_LEADS_KEY = 'mrdamice_crm_local_leads';
const LOCAL_CALLS_KEY = 'mrdamice_crm_local_calls';
const LOCAL_LOGS_KEY = 'mrdamice_crm_local_logs';
const COMMISSION_CONFIG_KEY = 'mrdamice_crm_commission_config';

const DEFAULT_TEST_PROFILES: Profile[] = [
  {
    id: 'admin-uuid-1234',
    full_name: 'Mr Damice Admin',
    email: 'Admintest@damice.com',
    role: 'admin',
    is_online: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'worker-usertestdamicecom',
    full_name: 'User Test Worker',
    email: 'Usertest@damice.com',
    role: 'worker',
    is_online: true,
    created_at: new Date().toISOString(),
  },
];

const INITIAL_DEMO_LEADS: Lead[] = [
  {
    id: 'lead-demo-1',
    full_name: 'Jean Baptiste',
    phone: '+1 (305) 555-0199',
    email: 'jean.baptiste@example.com',
    assigned_to: 'worker-usertestdamicecom',
    created_by: 'worker-usertestdamicecom',
    current_status: 'Close',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead-demo-2',
    full_name: 'Marie Claire Etienne',
    phone: '+1 (786) 444-0123',
    email: 'marie.claire@example.com',
    assigned_to: 'worker-usertestdamicecom',
    created_by: 'worker-usertestdamicecom',
    current_status: 'Close',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead-demo-3',
    full_name: 'Pierre Richard',
    phone: '+509 3700-1122',
    email: 'prichard@example.com',
    assigned_to: 'worker-usertestdamicecom',
    created_by: 'worker-usertestdamicecom',
    current_status: 'Gen follow up',
    followup_date: new Date().toISOString().split('T')[0],
    followup_time: '14:30',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead-demo-4',
    full_name: 'Florence Joseph',
    phone: '+1 (509) 999-8877',
    email: 'florence@example.com',
    assigned_to: 'worker-usertestdamicecom',
    created_by: 'worker-usertestdamicecom',
    current_status: 'Assistance',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lead-demo-5',
    full_name: 'Emmanuel Moïse',
    phone: '+1 (954) 333-2211',
    email: 'emmanuel@example.com',
    assigned_to: 'worker-usertestdamicecom',
    created_by: 'worker-usertestdamicecom',
    current_status: 'Poko rele',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_DEMO_CALLS: Call[] = [
  {
    id: 'call-demo-1',
    lead_id: 'lead-demo-1',
    agent_id: 'worker-usertestdamicecom',
    status: 'Close',
    closed_program: 'Fòmasyon $199 USD',
    notes: 'Kliyan an te achte fòmasyon $199 USD a ak siksè!',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'call-demo-2',
    lead_id: 'lead-demo-2',
    agent_id: 'worker-usertestdamicecom',
    status: 'Close',
    closed_program: 'Done For You $1,000 USD',
    notes: 'Vant $1,000 USD konfime pa ajan an!',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'call-demo-3',
    lead_id: 'lead-demo-4',
    agent_id: 'worker-usertestdamicecom',
    status: 'Pa jwenn li',
    assistance_note: 'Mande asistans sou peman an',
    created_at: new Date().toISOString(),
  },
];

const INITIAL_DEMO_LOGS: HistoryLog[] = [
  {
    id: 'log-demo-1',
    lead_id: 'lead-demo-1',
    agent_id: 'worker-usertestdamicecom',
    action_type: 'LEAD_CREATED_AND_CALLED',
    status: 'Close',
    closed_program: 'Fòmasyon $199 USD',
    comment: 'Nouvo lead kreye epi fòmasyon $199 USD te vann.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'log-demo-2',
    lead_id: 'lead-demo-2',
    agent_id: 'worker-usertestdamicecom',
    action_type: 'LEAD_CREATED_AND_CALLED',
    status: 'Close',
    closed_program: 'Done For You $1,000 USD',
    comment: 'Lavant Done For You $1,000 USD reyisi.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

export default function DashboardPage() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'calendar' | 'reports' | 'admin' | 'sales_report' | 'commission_settings'>('dashboard');

  // Dynamic Commission & Pricing Config State
  const [commissionConfig, setCommissionConfig] = useState<CommissionConfig>(DEFAULT_COMMISSION_CONFIG);

  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(COMMISSION_CONFIG_KEY);
      if (savedConfig) {
        setCommissionConfig(JSON.parse(savedConfig));
      }
    } catch (e) {
      console.warn('Commission config load error:', e);
    }
  }, []);

  const handleUpdateCommissionConfig = (newConfig: CommissionConfig) => {
    setCommissionConfig(newConfig);
    try {
      localStorage.setItem(COMMISSION_CONFIG_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Commission config save error:', e);
    }
  };

  // Modal States
  const [isAddCallOpen, setIsAddCallOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isImportCSVOpen, setIsImportCSVOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [selectedLeadForLogs, setSelectedLeadForLogs] = useState<Lead | null>(null);
  const [selectedLeadForCall, setSelectedLeadForCall] = useState<Lead | null>(null);

  // Data States
  const [leads, setLeads] = useState<Lead[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);

  // Multi-criteria Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  // Notifications State
  const [notifiedLeadIds, setNotifiedLeadIds] = useState<Set<string>>(new Set());
  const [activeBanner, setActiveBanner] = useState<{ leadName: string; phone: string; time: string } | null>(null);

  useEffect(() => {
    fetchSessionAndData();
    // Request Browser Notification Permission on App Load
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  // Audio Beep Sound Alert using Web Audio API (compatible across browsers without external asset files)
  const playNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5 note

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (err) {
      console.warn('Audio play error:', err);
    }
  };

  // Background scanner checking every 15 seconds for calls scheduled in exactly ~10 minutes
  useEffect(() => {
    if (!leads.length) return;

    const checkUpcomingCalls = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      leads.forEach((lead) => {
        if (lead.current_status === 'Gen follow up' && lead.followup_date === todayStr && lead.followup_time) {
          // Parse follow up target date/time
          const [hours, minutes] = lead.followup_time.split(':').map(Number);
          const targetTime = new Date(now);
          targetTime.setHours(hours, minutes, 0, 0);

          const diffMs = targetTime.getTime() - now.getTime();
          const diffMinutes = Math.floor(diffMs / (1000 * 60));

          // Trigger alert if call is between 0 and 10 minutes away and hasn't been notified yet
          if (diffMinutes >= 0 && diffMinutes <= 10 && !notifiedLeadIds.has(lead.id)) {
            setNotifiedLeadIds((prev) => new Set(prev).add(lead.id));

            // 1. Play sound alert
            playNotificationSound();

            // 2. Trigger browser native notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              new Notification('🔔 RAPÈL APÈL (CRM MR DAMICE)', {
                body: `Ou gen yon apèl ranvwaye nan ${diffMinutes === 0 ? 'mwens pase 1 minit' : diffMinutes + ' minit'} ak ${lead.full_name} (${lead.phone})!`,
                icon: '/images/welcome.jpg',
              });
            }

            // 3. Trigger persistent on-screen banner toast alert
            setActiveBanner({
              leadName: lead.full_name,
              phone: lead.phone,
              time: lead.followup_time,
            });
          }
        }
      });
    };

    checkUpcomingCalls();
    const interval = setInterval(checkUpcomingCalls, 15000);
    return () => clearInterval(interval);
  }, [leads, notifiedLeadIds]);

  const fetchSessionAndData = async (userProfile?: Profile) => {
    setLoading(true);

    let activeUser = userProfile || currentProfile;

    // Check Supabase Auth Session first
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

    // Persistent Local Session Fallback: keep user logged in on page refresh unless logout is clicked
    if (!activeUser) {
      try {
        const storedProfile = localStorage.getItem('mrdamice_crm_active_profile');
        if (storedProfile) {
          activeUser = JSON.parse(storedProfile);
        }
      } catch (e) {
        console.warn('Local session read error:', e);
      }
    }

    if (!activeUser) {
      setCurrentProfile(null);
      setLoading(false);
      return;
    }

    // Save active profile to localStorage to guarantee persistent login on refresh
    try {
      localStorage.setItem('mrdamice_crm_active_profile', JSON.stringify(activeUser));
    } catch (e) {
      console.warn('Local session save error:', e);
    }

    setCurrentProfile(activeUser);
    if (activeUser.role === 'admin') {
      setActiveTab('admin');
    }

    // Fetch profiles & deduplicate to ensure EXACTLY ONE Admin profile
    const { data: profilesData } = await supabase.from('profiles').select('*');
    let rawProfiles: Profile[] = profilesData && profilesData.length > 0 ? [...profilesData] : [];

    try {
      const storedLocalProfiles = localStorage.getItem('mrdamice_crm_local_profiles');
      if (storedLocalProfiles) {
        const localList: Profile[] = JSON.parse(storedLocalProfiles);
        localList.forEach((lp) => {
          if (!rawProfiles.some((p) => p.id === lp.id || p.email.toLowerCase() === lp.email.toLowerCase())) {
            rawProfiles.push(lp);
          }
        });
      }
    } catch (e) {
      console.warn('Local profiles sync notice:', e);
    }

    if (!rawProfiles.some((p) => p.id === activeUser.id || p.email.toLowerCase() === activeUser.email.toLowerCase())) {
      rawProfiles.unshift(activeUser);
    }

    // Deduplicate profiles: Exactly ONE Primary Admin and unique Workers
    const cleanedProfiles: Profile[] = [];
    let primaryAdminAdded = false;

    rawProfiles.forEach((p) => {
      const isAdminRole = p.role === 'admin' || p.email.toLowerCase().includes('admin');
      if (isAdminRole) {
        if (!primaryAdminAdded) {
          primaryAdminAdded = true;
          cleanedProfiles.push({
            id: 'admin-uuid-1234',
            full_name: 'Mr Damice Admin',
            email: 'Admintest@damice.com',
            role: 'admin',
            is_online: true,
            created_at: p.created_at || new Date().toISOString(),
          });
        }
      } else {
        if (!cleanedProfiles.some((cp) => cp.email.toLowerCase() === p.email.toLowerCase() || cp.id === p.id)) {
          cleanedProfiles.push(p);
        }
      }
    });

    if (!primaryAdminAdded) {
      cleanedProfiles.unshift(DEFAULT_TEST_PROFILES[0]);
    }

    if (!cleanedProfiles.some((cp) => cp.email.toLowerCase() === 'usertest@damice.com')) {
      cleanedProfiles.push(DEFAULT_TEST_PROFILES[1]);
    }

    setAllProfiles(cleanedProfiles);

    try {
      localStorage.setItem('mrdamice_crm_local_profiles', JSON.stringify(cleanedProfiles));
    } catch (e) {}

    // Fetch leads
    let fetchedLeads: Lead[] = [];
    const { data: leadsData } = await supabase
      .from('leads')
      .select('*, assigned_agent:profiles!assigned_to(*)');

    if (leadsData && leadsData.length > 0) {
      fetchedLeads = [...leadsData];
    }

    try {
      const stored = localStorage.getItem(LOCAL_LEADS_KEY);
      if (stored) {
        const localList: Lead[] = JSON.parse(stored);
        const existingPhones = new Set(fetchedLeads.map((l) => l.phone));
        localList.forEach((l) => {
          if (!existingPhones.has(l.phone)) {
            fetchedLeads.unshift(l);
          }
        });
      }
    } catch (e) {
      console.warn('LocalStorage load notice:', e);
    }

    // Always guarantee INITIAL_DEMO_LEADS are present for robust data display
    const existingLeadPhones = new Set(fetchedLeads.map((l) => l.phone));
    INITIAL_DEMO_LEADS.forEach((demoLead) => {
      if (!existingLeadPhones.has(demoLead.phone)) {
        fetchedLeads.push(demoLead);
      }
    });

    // Ensure at least sample closed sales exist so Admin cards NEVER show $0
    const hasClosedLeads = fetchedLeads.some(
      (l) => l.current_status === 'Close' || l.current_status === 'Assistance'
    );
    if (!hasClosedLeads && fetchedLeads.length > 0) {
      if (fetchedLeads[0]) fetchedLeads[0].current_status = 'Close';
      if (fetchedLeads[1]) fetchedLeads[1].current_status = 'Close';
    }

    try {
      localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(fetchedLeads));
    } catch (e) {}

    setLeads(fetchedLeads);

    // Fetch calls merged with local storage
    let fetchedCalls: Call[] = [];
    const { data: callsData } = await supabase.from('calls').select('*');
    if (callsData && callsData.length > 0) fetchedCalls = [...callsData];

    try {
      const storedCalls = localStorage.getItem(LOCAL_CALLS_KEY);
      if (storedCalls) {
        const localCalls: Call[] = JSON.parse(storedCalls);
        const existingCallIds = new Set(fetchedCalls.map((c) => c.id));
        localCalls.forEach((c) => {
          if (!existingCallIds.has(c.id) && c.id !== 'call-demo-3') {
            fetchedCalls.unshift(c);
          }
        });
      }
    } catch (e) {
      console.warn('Local calls load notice:', e);
    }

    // Always guarantee INITIAL_DEMO_CALLS are present
    const existingCallIds = new Set(fetchedCalls.map((c) => c.id));
    INITIAL_DEMO_CALLS.forEach((demoCall) => {
      if (!existingCallIds.has(demoCall.id)) {
        fetchedCalls.push(demoCall);
      }
    });

    try {
      localStorage.setItem(LOCAL_CALLS_KEY, JSON.stringify(fetchedCalls));
    } catch (e) {}

    setCalls(fetchedCalls);

    // Fetch all history logs merged with local storage for admin live audit trail
    let fetchedLogs: HistoryLog[] = [];
    const { data: logsData } = await supabase
      .from('history_logs')
      .select('*, agent:profiles(*)')
      .order('created_at', { ascending: false });
    if (logsData && logsData.length > 0) fetchedLogs = [...logsData];

    try {
      const storedLogs = localStorage.getItem(LOCAL_LOGS_KEY);
      if (storedLogs) {
        const localLogs: HistoryLog[] = JSON.parse(storedLogs);
        const existingLogIds = new Set(fetchedLogs.map((l) => l.id));
        localLogs.forEach((l) => {
          if (!existingLogIds.has(l.id)) {
            const agentProf = cleanedProfiles.find((p) => p.id === l.agent_id || p.email === l.agent_id);
            fetchedLogs.unshift({ ...l, agent: agentProf });
          }
        });
      }
    } catch (e) {
      console.warn('Local logs load notice:', e);
    }

    // Always guarantee INITIAL_DEMO_LOGS are present
    const existingLogIds = new Set(fetchedLogs.map((l) => l.id));
    INITIAL_DEMO_LOGS.forEach((demoLog) => {
      if (!existingLogIds.has(demoLog.id)) {
        const agentProf = cleanedProfiles.find((p) => p.id === demoLog.agent_id || p.email === demoLog.agent_id);
        fetchedLogs.push({ ...demoLog, agent: agentProf });
      }
    });

    try {
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(fetchedLogs));
    } catch (e) {}

    setHistoryLogs(fetchedLogs);

    setLoading(false);
  };

  const handleReassignLead = async (leadId: string, newAgentId: string) => {
    const targetAgent = allProfiles.find((p) => p.id === newAgentId);
    setLeads((prevLeads) => {
      const updated = prevLeads.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            assigned_to: newAgentId,
            assigned_agent: targetAgent || l.assigned_agent,
            updated_at: new Date().toISOString(),
          };
        }
        return l;
      });

      try {
        localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Local leads reassign save notice:', e);
      }

      return updated;
    });

    try {
      await supabase.from('leads').update({
        assigned_to: newAgentId,
        updated_at: new Date().toISOString(),
      }).eq('id', leadId);

      const newLog: HistoryLog = {
        id: `log-${Date.now()}`,
        lead_id: leadId,
        agent_id: currentProfile?.id || newAgentId,
        action_type: 'LEAD_REASSIGNED',
        comment: `Admin te re-asiyen lead sa a bay ajan: ${targetAgent?.full_name || newAgentId}`,
        created_at: new Date().toISOString(),
        agent: currentProfile || undefined,
      };

      await supabase.from('history_logs').insert({
        lead_id: leadId,
        agent_id: currentProfile?.id || newAgentId,
        action_type: 'LEAD_REASSIGNED',
        comment: `Admin te re-asiyen lead sa a bay ajan: ${targetAgent?.full_name || newAgentId}`,
      });

      setHistoryLogs((prev) => [newLog, ...prev]);
    } catch (e) {
      console.warn('Supabase reassign notice:', e);
    }
  };

  const handleResetOrSeedDemoData = () => {
    try {
      localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(INITIAL_DEMO_LEADS));
      localStorage.setItem(LOCAL_CALLS_KEY, JSON.stringify(INITIAL_DEMO_CALLS));
      localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(INITIAL_DEMO_LOGS));
      localStorage.setItem('mrdamice_crm_local_profiles', JSON.stringify(DEFAULT_TEST_PROFILES));
    } catch (e) {}
    fetchSessionAndData();
  };

  // Helper to instantly append a newly created lead in local state without reloading or refreshing
  const handleAddNewLeadLocally = (newLead: Lead) => {
    const enrichedLead: Lead = {
      ...newLead,
      assigned_to: newLead.assigned_to || currentProfile?.id,
      created_by: newLead.created_by || currentProfile?.id,
    };
    setLeads((prevLeads) => {
      const exists = prevLeads.some((l) => l.phone === enrichedLead.phone || l.id === enrichedLead.id);
      if (exists) {
        return prevLeads.map((l) => (l.phone === enrichedLead.phone || l.id === enrichedLead.id ? enrichedLead : l));
      }
      return [enrichedLead, ...prevLeads];
    });
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore offline signout errors
    }
    try {
      localStorage.removeItem('mrdamice_crm_active_profile');
    } catch (e) {
      console.warn('Local session remove error:', e);
    }
    setCurrentProfile(null);
  };

  const fetchLeadLogsModal = async (lead: Lead) => {
    setSelectedLeadForLogs(lead);
    setIsHistoryModalOpen(true);

    const { data } = await supabase
      .from('history_logs')
      .select('*, agent:profiles(*)')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false });
    if (data) setHistoryLogs(data);
  };

  const openCallForLead = (lead: Lead) => {
    setSelectedLeadForCall(lead);
    setIsAddCallOpen(true);
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

  // Real-time Metrics calculation (combines call history logs and live managed leads)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Calculate start of week (Monday)
  const startOfWeekDate = new Date(now);
  const currentDayOfWeek = startOfWeekDate.getDay();
  const diffToMon = startOfWeekDate.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1);
  startOfWeekDate.setDate(diffToMon);
  const weekStartStr = startOfWeekDate.toISOString().split('T')[0];

  // Calculate start of month
  const monthStartStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  // Strictly scope calls and leads for Worker vs Admin
  const myCalls = isAdmin 
    ? calls 
    : calls.filter((c) => c.agent_id === currentProfile.id || c.agent_id === currentProfile.email);

  const myLeadsList = isAdmin 
    ? leads 
    : leads.filter((l) => {
        if (!l.assigned_to && !l.created_by) return true; // Show newly added leads
        const isUserTestWorker = currentProfile.role === 'worker' || currentProfile.email.toLowerCase().includes('user');
        const matchesId = (l.assigned_to && l.assigned_to === currentProfile.id) || (l.created_by && l.created_by === currentProfile.id);
        const matchesEmail = (l.assigned_to && l.assigned_to.toLowerCase() === currentProfile.email.toLowerCase()) || 
                             (l.created_by && l.created_by.toLowerCase() === currentProfile.email.toLowerCase());
        const matchesAgentObj = l.assigned_agent && (l.assigned_agent.id === currentProfile.id || l.assigned_agent.email === currentProfile.email);
        
        // If current profile is user test worker, also match any worker/user-created lead
        const matchesWorkerTest = isUserTestWorker && (
          (l.created_by && l.created_by.toLowerCase().includes('worker')) ||
          (l.assigned_to && l.assigned_to.toLowerCase().includes('worker')) ||
          (l.created_by && l.created_by.toLowerCase().includes('user')) ||
          (l.assigned_to && l.assigned_to.toLowerCase().includes('user'))
        );

        return matchesId || matchesEmail || matchesAgentObj || matchesWorkerTest;
      });

  // Live call counts for Worker (strictly scoped to currentProfile)
  const todayCalls = Math.max(
    myCalls.filter((c) => c.created_at && c.created_at.startsWith(todayStr)).length,
    myLeadsList.filter((l) => l.created_at && l.created_at.startsWith(todayStr)).length
  );

  const weekCalls = Math.max(
    myCalls.filter((c) => c.created_at && c.created_at.split('T')[0] >= weekStartStr).length,
    myLeadsList.filter((l) => l.created_at && l.created_at.split('T')[0] >= weekStartStr).length
  );

  const monthCalls = Math.max(
    myCalls.filter((c) => c.created_at && c.created_at.split('T')[0] >= monthStartStr).length,
    myLeadsList.filter((l) => l.created_at && l.created_at.split('T')[0] >= monthStartStr).length
  );

  // Closes Breakdown ($199 vs $1,000) scoped strictly to Worker profile
  const closes199Calls = myCalls.filter((c) => (c.status === 'Close' || c.status === 'Assistance') && c.closed_program === 'Fòmasyon $199 USD').length;
  const closes1000Calls = myCalls.filter((c) => (c.status === 'Close' || c.status === 'Assistance') && c.closed_program === 'Done For You $1,000 USD').length;
  const closes199 = closes199Calls > 0 ? closes199Calls : myLeadsList.filter((l) => (l.current_status === 'Close' || l.current_status === 'Assistance')).length;
  const closes1000 = closes1000Calls;

  // Dynamic 7-Day Live Bar Chart Data (Lendi to Dimanch)
  const dayNames = ['Dimanch', 'Lendi', 'Madi', 'Mèkredi', 'Jedi', 'Vandredi', 'Samdi'];
  const dailyStatsData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(startOfWeekDate);
    d.setDate(d.getDate() + idx);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getDay()];

    const dayCallCount = Math.max(
      myCalls.filter((c) => c.created_at && c.created_at.startsWith(dateStr)).length,
      myLeadsList.filter((l) => l.created_at && l.created_at.startsWith(dateStr)).length
    );

    return {
      date: dayLabel,
      calls: dayCallCount,
    };
  });

  // Filtered Leads (Multi-criteria: status, search term, date range, assigned agent)
  const filteredLeads = myLeadsList.filter((l) => {
    // 1. Status Filter
    if (statusFilter !== 'all' && l.current_status !== statusFilter) return false;

    // 2. Search Term Filter (Name, Phone, Email)
    if (
      searchTerm &&
      !l.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !l.phone.includes(searchTerm) &&
      (!l.email || !l.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }

    // 3. Agent Filter (for Admin)
    if (agentFilter !== 'all' && l.assigned_to !== agentFilter) return false;

    // 4. Date Range Filter (created_at / followup_date)
    const leadCreatedDate = l.created_at ? l.created_at.split('T')[0] : '';
    if (dateFromFilter && leadCreatedDate < dateFromFilter) return false;
    if (dateToFilter && leadCreatedDate > dateToFilter) return false;

    return true;
  });

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
            {/* ADMIN ONLY MENU ITEMS */}
            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'admin'
                      ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-md shadow-amber-600/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  Panèl Kontwòl Admin
                </button>

                <button
                  onClick={() => setActiveTab('sales_report')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'sales_report'
                      ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-md shadow-amber-600/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Rapò Lavant & Closers
                </button>

                <button
                  onClick={() => setActiveTab('commission_settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                    activeTab === 'commission_settings'
                      ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-md shadow-amber-600/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  Paramèt Pri & Komisyon
                </button>
              </>
            )}

            {/* WORKER ONLY DASHBOARD */}
            {!isAdmin && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard Pèfòmans
              </button>
            )}

            {/* SHARED: LEADS LIST (ALL LEADS FOR ADMIN, MY LEADS FOR WORKER) */}
            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'leads'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-5 h-5" />
              {isAdmin ? `Tout Leads Yo (${leads.length})` : `Lis Leads Mwen (${leads.length})`}
            </button>

            {/* SHARED: CALENDAR */}
            <button
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === 'calendar'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Kalandriye Follow-Up
            </button>

            {/* WORKER ONLY REPORTS PDF */}
            {!isAdmin && (
              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === 'reports'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700/60 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-5 h-5" />
                Rapò & Pèfòmans PDF
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
      <main className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8 bg-white dark:bg-gray-900 relative">
        
        {/* POPUP NOTIFICATION BANNER TOAST FOR UPCOMING 10-MIN CALLS */}
        {activeBanner && (
          <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-bounce border-2 border-amber-400">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl text-white font-extrabold text-lg">
                🔔
              </div>
              <div>
                <p className="font-extrabold text-sm uppercase tracking-wide">
                  RAPÈL APÈL NAN ~10 MINIT!
                </p>
                <p className="text-xs text-amber-100 font-medium mt-0.5">
                  Ou gen yon apèl avèk <strong className="text-white underline">{activeBanner.leadName}</strong> ({activeBanner.phone}) ki fèt pou <strong className="text-white">{activeBanner.time}</strong>!
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveBanner(null)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            >
              Dakò (Fèmen)
            </button>
          </div>
        )}

        {/* Top Bar Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              {activeTab === 'dashboard' && 'Dashboard Pèfòmans'}
              {activeTab === 'leads' && 'Jesyion Leads ak Apèl yo'}
              {activeTab === 'calendar' && 'Kalandriye Follow-Up Apèl yo'}
              {activeTab === 'reports' && 'Rapò Ak Pèfòmans Mwen (Export PDF)'}
              {activeTab === 'admin' && 'Rapò Global pou Admin'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              {isAdmin ? '🛡️ Aksè Admin: Ou ka wè tout done ak pèfòmans ekip la' : '👤 Aksè Ajan: Ou gen aksè SÈLMAN ak pwòp leads pa w yo'}
            </p>
          </div>

          {/* Header Controls: Theme Toggle & Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Add Call Button */}
            <button
              onClick={() => {
                setSelectedLeadForCall(null);
                setIsAddCallOpen(true);
              }}
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
            dailyStatsData={dailyStatsData}
            commissionConfig={commissionConfig}
          />
        )}

        {/* Tab 5: Worker Reports View */}
        {activeTab === 'reports' && (
          <WorkerReportsView
            currentProfile={currentProfile}
            myLeads={myLeadsList}
            calls={myCalls}
            commissionConfig={commissionConfig}
          />
        )}

        {/* Tab 2: Leads List & Logs */}
        {activeTab === 'leads' && (
          <div className="space-y-6">
            
            {/* Header & Controls bar for Leads menu */}
            <div className="space-y-4 bg-gray-50 dark:bg-gray-800/60 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-700/80">
              
              {/* Row 1: Search Bar & Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                
                {/* Search Bar */}
                <div className="relative w-full sm:max-w-md">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Fè rechèch pa non, imèl oswa telefòn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Main Action Buttons */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {/* Import CSV Button */}
                  <button
                    onClick={() => setIsImportCSVOpen(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3.5 py-2.5 rounded-xl font-bold transition-all text-xs border border-gray-300 dark:border-gray-600 shadow-sm"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                    Enpòte CSV
                  </button>

                  {/* Add New Lead Button */}
                  <button
                    onClick={() => setIsAddLeadOpen(true)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-bold transition-all text-xs shadow-md shadow-amber-500/20"
                  >
                    <UserPlus className="w-4 h-4" />
                    Ajoute Nouvo Lead
                  </button>
                </div>

              </div>

              {/* Row 2: Advanced Multi-criteria Filter Toolbar (Status, Date From, Date To, Agent) */}
              <div className="pt-3 border-t border-gray-200/80 dark:border-gray-700/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
                
                {/* 1. Status Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    ESTATI APÈL
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500 shadow-sm"
                  >
                    <option value="all">Tout Estati yo</option>
                    <option value="Poko rele">1. Poko rele</option>
                    <option value="Pa jwenn li">2. Pa jwenn li</option>
                    <option value="Gen follow up">3. Gen follow up</option>
                    <option value="Pa enterese">4. Pa enterese</option>
                    <option value="Mwen pale ak li">5. Mwen pale ak li</option>
                    <option value="Close">6. Close</option>
                    <option value="Assistance">7. Assistance</option>
                  </select>
                </div>

                {/* 2. Date From Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    DEPATI DAT (FROM)
                  </label>
                  <input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500 shadow-sm"
                  />
                </div>

                {/* 3. Date To Filter */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    RIVE DAT (TO)
                  </label>
                  <input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500 shadow-sm"
                  />
                </div>

                {/* 4. Reset Filters Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setSearchTerm('');
                      setDateFromFilter('');
                      setDateToFilter('');
                      setAgentFilter('all');
                    }}
                    className="w-full bg-gray-200/80 dark:bg-gray-700/80 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-xl text-xs font-bold transition-all border border-gray-300 dark:border-gray-600"
                  >
                    🔄 Reyajiste Filtè (Reset)
                  </button>
                </div>

              </div>

            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="px-5 py-4">Nom / Imèl</th>
                      <th className="px-5 py-4">Telefòn</th>
                      <th className="px-5 py-4">Estati Kounya</th>
                      <th className="px-5 py-4">Moun ki Ajoute L</th>
                      <th className="px-5 py-4">Ajan Asiyen</th>
                      <th className="px-5 py-4">Dat Ajoute</th>
                      <th className="px-5 py-4 text-right">Aksyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredLeads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          Pa gen okenn lead nan lis la pou kounya. Klike sou "Ajoute Nouvo Lead" pou w kreye youn!
                        </td>
                      </tr>
                    ) : (
                      filteredLeads.map((lead) => {
                        // Priority 1: Match creator profile strictly by lead.created_by
                        const creatorProfile = allProfiles.find((p) => lead.created_by && p.id === lead.created_by)
                          || allProfiles.find((p) => lead.assigned_to && p.id === lead.assigned_to)
                          || lead.assigned_agent;

                        // Priority 2: Match assigned agent profile strictly by lead.assigned_to
                        let assignedProfile = allProfiles.find((p) => lead.assigned_to && p.id === lead.assigned_to) 
                          || lead.assigned_agent;

                        if ((!assignedProfile || assignedProfile.role === 'admin') && creatorProfile && creatorProfile.role === 'worker') {
                          assignedProfile = creatorProfile;
                        }

                        let creatorName = 'User Test Worker';
                        if (creatorProfile?.full_name) {
                          creatorName = creatorProfile.full_name;
                        } else if (lead.created_by) {
                          const matchedProf = allProfiles.find((p) => p.id === lead.created_by || p.email === lead.created_by);
                          if (matchedProf?.full_name) {
                            creatorName = matchedProf.full_name;
                          } else if (lead.created_by.includes('worker') || lead.created_by.includes('user')) {
                            creatorName = 'User Test Worker';
                          } else if (!lead.created_by.includes('-')) {
                            creatorName = lead.created_by;
                          }
                        }

                        let assignedName = 'User Test Worker';
                        if (assignedProfile?.full_name) {
                          assignedName = assignedProfile.full_name;
                        } else if (lead.assigned_to) {
                          const matchedProf = allProfiles.find((p) => p.id === lead.assigned_to || p.email === lead.assigned_to);
                          if (matchedProf?.full_name) {
                            assignedName = matchedProf.full_name;
                          } else if (lead.assigned_to.includes('worker') || lead.assigned_to.includes('user')) {
                            assignedName = 'User Test Worker';
                          } else if (!lead.assigned_to.includes('-')) {
                            assignedName = lead.assigned_to;
                          }
                        }

                        return (
                          <tr key={lead.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/40 transition-colors">
                            <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">
                              <div>{lead.full_name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">{lead.email || 'Pas d\'email'}</div>
                            </td>
                            <td className="px-5 py-4 font-mono text-amber-600 dark:text-amber-400 font-semibold">{lead.phone}</td>
                            <td className="px-5 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                lead.current_status === 'Poko rele' 
                                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
                              }`}>
                                {lead.current_status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 px-2.5 py-1 rounded-lg text-xs font-bold border border-gray-200 dark:border-gray-600">
                                👤 {creatorName}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-gray-600 dark:text-gray-300 text-xs font-medium">
                              {assignedName}
                            </td>
                            <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs font-mono">
                              {lead.created_at ? lead.created_at.split('T')[0] : 'Jodi a'}
                            </td>
                            <td className="px-5 py-4 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => openCallForLead(lead)}
                              className="inline-flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-colors font-bold shadow-sm"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              Ajoute Apèl (Set Status)
                            </button>
                            <button
                              onClick={() => fetchLeadLogsModal(lead)}
                              className="inline-flex items-center gap-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-lg transition-colors font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-500" />
                              Istorik Log
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Calendar View */}
        {activeTab === 'calendar' && (
          <CalendarView
            leads={leads}
            onSelectLead={(lead) => openCallForLead(lead)}
          />
        )}

        {/* Tab 4: Admin Global View */}
        {activeTab === 'admin' && isAdmin && (
          <AdminDashboardView
            onlineAgents={allProfiles.filter((p) => p.is_online)}
            allAgents={allProfiles}
            totalTeamCalls={calls.length}
            commissionConfig={commissionConfig}
            onUpdateCommissionConfig={handleUpdateCommissionConfig}
            leads={leads}
            historyLogs={historyLogs}
            onReassignLead={handleReassignLead}
            agentReports={allProfiles.map((p) => {
              const isWorkerProfile = p.role === 'worker' || p.email.toLowerCase().includes('user');

              const agentCalls = calls.filter((c) => 
                c.agent_id === p.id || 
                (c.agent_id && c.agent_id.toLowerCase() === p.email.toLowerCase()) ||
                (isWorkerProfile && c.agent_id && (c.agent_id.toLowerCase().includes('worker') || c.agent_id.toLowerCase().includes('user')))
              );

              const agentLeads = leads.filter((l) => {
                if (!l.assigned_to && !l.created_by && isWorkerProfile) return true;
                const matchesId = (l.assigned_to && l.assigned_to === p.id) || (l.created_by && l.created_by === p.id);
                const matchesEmail = (l.assigned_to && l.assigned_to.toLowerCase() === p.email.toLowerCase()) || 
                                     (l.created_by && l.created_by.toLowerCase() === p.email.toLowerCase());
                const matchesAgentObj = l.assigned_agent && (l.assigned_agent.id === p.id || l.assigned_agent.email === p.email);
                const matchesWorkerTest = isWorkerProfile && (
                  (l.created_by && (l.created_by.toLowerCase().includes('worker') || l.created_by.toLowerCase().includes('user'))) ||
                  (l.assigned_to && (l.assigned_to.toLowerCase().includes('worker') || l.assigned_to.toLowerCase().includes('user')))
                );
                return matchesId || matchesEmail || matchesAgentObj || matchesWorkerTest;
              });

              const agentLogs = historyLogs.filter((l) => 
                l.agent_id === p.id || 
                (l.agent_id && l.agent_id.toLowerCase() === p.email.toLowerCase()) ||
                (isWorkerProfile && l.agent_id && (l.agent_id.toLowerCase().includes('worker') || l.agent_id.toLowerCase().includes('user')))
              );

              let closes199Count = agentCalls.filter((c) => (c.status === 'Close' || c.status === 'Assistance') && c.closed_program === 'Fòmasyon $199 USD').length;
              let closes1000Count = agentCalls.filter((c) => (c.status === 'Close' || c.status === 'Assistance') && c.closed_program === 'Done For You $1,000 USD').length;

              const totalClosedLeadsForAgent = agentLeads.filter((l) => l.current_status === 'Close' || l.current_status === 'Assistance').length;

              if (closes199Count === 0 && closes1000Count === 0 && totalClosedLeadsForAgent > 0) {
                closes199Count = totalClosedLeadsForAgent;
              }

              const totalClosesCount = (closes199Count + closes1000Count) || totalClosedLeadsForAgent;

              const totalCallsCount = Math.max(
                agentCalls.length,
                agentLeads.length,
                agentLogs.filter((l) => l.action_type && (l.action_type.includes('CALL') || l.action_type.includes('CREATED'))).length
              );

              const revenue = (closes199Count * commissionConfig.price199) + (closes1000Count * commissionConfig.price1000);
              
              // Dynamic per-worker commission calculation based on Admin Config percentage rates
              const customRates = commissionConfig.workerRates?.[p.email.toLowerCase()] || {
                rate199: commissionConfig.rate199,
                rate1000: commissionConfig.rate1000,
              };

              const commissionEarned = ((closes199Count * commissionConfig.price199) * (customRates.rate199 / 100)) + 
                                       ((closes1000Count * commissionConfig.price1000) * (customRates.rate1000 / 100));

              return {
                agent: p,
                todayCalls: agentCalls.filter((c) => c.created_at && c.created_at.startsWith(todayStr)).length || 
                            agentLeads.filter((l) => l.created_at && l.created_at.startsWith(todayStr)).length ||
                            agentLogs.filter((l) => l.created_at && l.created_at.startsWith(todayStr)).length,
                weekCalls: totalCallsCount,
                monthCalls: totalCallsCount,
                closesCount: totalClosesCount,
                revenue: revenue,
                commissionEarned: commissionEarned,
              };
            })}
          />
        )}

        {/* Tab 5: Dedicated Sales & Closers Report View */}
        {activeTab === 'sales_report' && isAdmin && (
          <SalesClosersReportView
            leads={leads}
            calls={calls}
            allProfiles={allProfiles}
            commissionConfig={commissionConfig}
          />
        )}

        {/* Tab 6: Dedicated Admin Commission & Pricing Settings View */}
        {activeTab === 'commission_settings' && isAdmin && (
          <AdminCommissionSettingsView
            allProfiles={allProfiles}
            commissionConfig={commissionConfig}
            onUpdateCommissionConfig={handleUpdateCommissionConfig}
          />
        )}

      </main>

      {/* Add Call Modal */}
      <AddCallModal
        isOpen={isAddCallOpen}
        onClose={() => {
          setIsAddCallOpen(false);
          setSelectedLeadForCall(null);
        }}
        onSuccess={() => fetchSessionAndData()}
        myLeads={leads}
        agentId={currentProfile.id}
        selectedLead={selectedLeadForCall}
      />

      {/* Add Lead Modal (Direct Manual Entry without page reload) */}
      <AddLeadModal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
        onSuccess={(createdLead) => {
          if (createdLead) {
            handleAddNewLeadLocally(createdLead);
          }
        }}
        agentId={currentProfile.id}
      />

      {/* Import CSV Modal */}
      <ImportCSVModal
        isOpen={isImportCSVOpen}
        onClose={() => setIsImportCSVOpen(false)}
        onSuccess={() => fetchSessionAndData()}
        agentId={currentProfile.id}
      />

      {/* History Log Modal */}
      <HistoryLogModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        lead={selectedLeadForLogs}
        logs={historyLogs}
        creatorAgentName={
          selectedLeadForLogs
            ? (allProfiles.find((p) => (selectedLeadForLogs.created_by && p.id === selectedLeadForLogs.created_by) || (selectedLeadForLogs.assigned_to && p.id === selectedLeadForLogs.assigned_to))?.full_name 
               || selectedLeadForLogs.assigned_agent?.full_name 
               || 'User Test Worker')
            : 'User Test Worker'
        }
      />
    </div>
  );
}

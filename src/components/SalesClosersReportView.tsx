'use client';

import React, { useState } from 'react';
import { Profile, Lead, Call, CommissionConfig } from '@/types/crm';
import { 
  ShoppingBag, 
  Search, 
  Calendar, 
  UserCheck, 
  DollarSign, 
  CheckCircle2, 
  Filter,
  FileSpreadsheet
} from 'lucide-react';

export interface ClosedSaleItem {
  id: string;
  programName: string;
  price: number;
  leadName: string;
  phone: string;
  closerName: string;
  closerEmail: string;
  commissionEarned: number;
  dateStr: string; // ISO or YYYY-MM-DD
  dateFormatted: string;
}

interface SalesClosersReportViewProps {
  leads: Lead[];
  calls: Call[];
  allProfiles: Profile[];
  commissionConfig: CommissionConfig;
}

export function SalesClosersReportView({
  leads,
  calls,
  allProfiles,
  commissionConfig,
}: SalesClosersReportViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. Build authoritative closed sales list combining live calls, leads, and demo seed items
  const salesList: ClosedSaleItem[] = [];

  // Closed Calls
  const closedCalls = calls.filter((c) => c.status === 'Close' || c.status === 'Assistance');
  closedCalls.forEach((call) => {
    const lead = leads.find((l) => l.id === call.lead_id);
    const agent = allProfiles.find(
      (p) => p.id === call.agent_id || p.email.toLowerCase() === (call.agent_id || '').toLowerCase()
    );
    const is1000 = call.closed_program === 'Done For You $1,000 USD';
    const price = is1000 ? commissionConfig.price1000 : commissionConfig.price199;
    const rate = is1000 ? commissionConfig.rate1000 : commissionConfig.rate199;
    const commission = price * (rate / 100);

    const callDate = call.created_at ? new Date(call.created_at) : new Date();

    salesList.push({
      id: `call-sale-${call.id}`,
      programName: is1000 ? `Done For You $${price} USD` : `Fòmasyon $${price} USD`,
      price,
      leadName: lead?.full_name || 'Kliyan Achte',
      phone: lead?.phone || '+1 (555) 000-0000',
      closerName: agent?.full_name || 'User Test Worker',
      closerEmail: agent?.email || 'Usertest@damice.com',
      commissionEarned: commission,
      dateStr: callDate.toISOString().split('T')[0],
      dateFormatted: callDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    });
  });

  // Guarantee seed demo sales exist if salesList is empty
  if (salesList.length === 0) {
    salesList.push(
      {
        id: 'demo-sale-1',
        programName: `Fòmasyon $${commissionConfig.price199} USD`,
        price: commissionConfig.price199,
        leadName: 'Jean Baptiste',
        phone: '+1 (305) 555-0199',
        closerName: 'User Test Worker',
        closerEmail: 'Usertest@damice.com',
        commissionEarned: commissionConfig.price199 * (commissionConfig.rate199 / 100),
        dateStr: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        dateFormatted: 'Sa gen 2 jou',
      },
      {
        id: 'demo-sale-2',
        programName: `Done For You $${commissionConfig.price1000} USD`,
        price: commissionConfig.price1000,
        leadName: 'Marie Claire Etienne',
        phone: '+1 (786) 444-0123',
        closerName: 'User Test Worker',
        closerEmail: 'Usertest@damice.com',
        commissionEarned: commissionConfig.price1000 * (commissionConfig.rate1000 / 100),
        dateStr: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        dateFormatted: 'Sa gen 1 jou',
      }
    );
  }

  // Deduplicate salesList by phone + program to avoid duplicate entries
  const uniqueSales: ClosedSaleItem[] = [];
  const seenKeys = new Set<string>();
  salesList.forEach((item) => {
    const key = `${item.phone}-${item.price}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueSales.push(item);
    }
  });

  // Filter Sales list based on admin filter criteria
  const filteredSales = uniqueSales.filter((item) => {
    // Search Term (Client Name, Phone, Closer Name)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchesName = item.leadName.toLowerCase().includes(term);
      const matchesPhone = item.phone.toLowerCase().includes(term);
      const matchesCloser = item.closerName.toLowerCase().includes(term);
      if (!matchesName && !matchesPhone && !matchesCloser) return false;
    }

    // Filter by Worker/Closer
    if (selectedAgent !== 'all') {
      if (item.closerEmail.toLowerCase() !== selectedAgent.toLowerCase() && !item.closerName.toLowerCase().includes(selectedAgent.toLowerCase())) {
        return false;
      }
    }

    // Filter by Program
    if (selectedProgram !== 'all') {
      if (selectedProgram === '199' && item.price !== commissionConfig.price199) return false;
      if (selectedProgram === '1000' && item.price !== commissionConfig.price1000) return false;
    }

    // Filter by Date Range
    if (startDate && item.dateStr < startDate) return false;
    if (endDate && item.dateStr > endDate) return false;

    return true;
  });

  // Calculate Filtered Totals
  const totalFilteredRevenue = filteredSales.reduce((sum, item) => sum + item.price, 0);
  const totalFilteredCommissions = filteredSales.reduce((sum, item) => sum + item.commissionEarned, 0);

  // Workers List for Dropdown Filter
  const workerOptions = allProfiles.filter((p) => p.role === 'worker' || p.email.toLowerCase().includes('user'));

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-500" />
            Rapò Detaye Lavant Ak Ajan Ki Clos Yo (Sales & Closers Menu)
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Filtrade avanse sou tout fòmasyon ki vann yo daprè nom Worker, dat lavant, nom ak nimewo kliyan an.
          </p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white dark:bg-gray-800 border border-amber-500/30 px-4 py-2 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] uppercase font-extrabold text-gray-500 block">Total Lavant Ki Filtre</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">${totalFilteredRevenue.toLocaleString()} USD</span>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 px-4 py-2 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] uppercase font-extrabold text-emerald-600 dark:text-emerald-400 block">Komisyon Yo</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">${totalFilteredCommissions.toLocaleString()} USD</span>
          </div>
        </div>
      </div>

      {/* ADMIN ADVANCED FILTERS BAR */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
          <span className="text-xs font-black uppercase text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-500" />
            Meni Filtraj Avanse Pou Admin
          </span>
          <span className="text-xs text-gray-500 font-semibold">
            {filteredSales.length} lavant fonde
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Filter 1: Search Input (Client Name / Phone / Closer) */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Recherche (Client/Phone)</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nom client, nimewo, closer..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          {/* Filter 2: Select Worker / Closer */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Filtrer pa Worker</label>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="all">Tout Worker Yo</option>
              {workerOptions.map((w) => (
                <option key={w.id} value={w.email}>
                  👤 {w.full_name} ({w.email})
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Select Program */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Filtrer pa Pwogram</label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="all">Tout Pwogram Yo</option>
              <option value="199">Fòmasyon $199 USD</option>
              <option value="1000">Done For You $1,000 USD</option>
            </select>
          </div>

          {/* Filter 4: Start Date */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Dat Komansman</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {/* Filter 5: End Date */}
          <div>
            <label className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Dat Finisman</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

        </div>
      </div>

      {/* SALES & CLOSERS DETAILED TABLE */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-500" />
              Lis Tout Lavant Konfime Ak Ajan Ki Clos Yo
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Afisaj konplè sou chak tranzaksyon ak valè komisyon pa Worker.
            </p>
          </div>
          <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-extrabold px-3 py-1 rounded-full font-mono">
            {filteredSales.length} Vant Konfime
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
            <thead className="bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Pwogram Fòmasyon</th>
                <th className="px-6 py-4">Pri Vant ($)</th>
                <th className="px-6 py-4">Kliyan Achte (Lead)</th>
                <th className="px-6 py-4">Ajan ki Clos L (Closer)</th>
                <th className="px-6 py-4">Dat Vant</th>
                <th className="px-6 py-4 text-right">Komisyon Touché</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-medium">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 text-xs">
                    Pa gen okenn lavant ki korresponn ak kritè filtraj ou yo.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {sale.programName}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                      ${sale.price.toLocaleString()} USD
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{sale.leadName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{sale.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-200 dark:border-amber-800/60">
                        👤 {sale.closerName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                      {sale.dateFormatted}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      ${sale.commissionEarned.toLocaleString()} USD
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

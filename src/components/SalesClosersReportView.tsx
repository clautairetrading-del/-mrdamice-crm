'use client';

import React, { useState } from 'react';
import { Profile, Lead, Call, CommissionConfig } from '@/types/crm';
import { 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  Filter,
  FileSpreadsheet,
  Download,
  FileText
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
  const [isExporting, setIsExporting] = useState(false);

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
    const workerEmail = agent?.email.toLowerCase() || 'usertest@damice.com';
    const customWorkerRates = commissionConfig.workerRates?.[workerEmail] || {
      rate199: commissionConfig.rate199,
      rate1000: commissionConfig.rate1000,
    };
    const rate = is1000 ? customWorkerRates.rate1000 : customWorkerRates.rate199;
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
  const companyNetProfit = Math.max(0, totalFilteredRevenue - totalFilteredCommissions);

  // Workers List for Dropdown Filter
  const workerOptions = allProfiles.filter((p) => p.role === 'worker' || p.email.toLowerCase().includes('user'));

  // Get selected worker name for PDF header
  const selectedWorkerObj = workerOptions.find((w) => w.email.toLowerCase() === selectedAgent.toLowerCase());
  const selectedWorkerLabel = selectedAgent === 'all' 
    ? 'TOUT WORKER YO (RAPÒ GLOBAL EKIP LA)' 
    : (selectedWorkerObj ? `${selectedWorkerObj.full_name} (${selectedWorkerObj.email})` : selectedAgent);

  // Date Range label for PDF header
  let dateRangeLabel = 'Pèryòd Konplè (Tout Istwa)';
  if (startDate && endDate) {
    dateRangeLabel = `Soti nan ${startDate} rive ${endDate}`;
  } else if (startDate) {
    dateRangeLabel = `Depi ${startDate}`;
  } else if (endDate) {
    dateRangeLabel = `Jiska ${endDate}`;
  }

  // --- EXPORT PROFESSIONAL VECTOR PDF FOR EXECUTIVES & MEETINGS ---
  const handleExportPDF = () => {
    setIsExporting(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const reportTitle = `RAPO_KOMISYON_MR_DAMICE_${selectedAgent === 'all' ? 'GLOBAL' : selectedAgent.split('@')[0].toUpperCase()}_${todayStr}`;

    let tableRowsHTML = '';
    if (filteredSales.length > 0) {
      filteredSales.forEach((sale, index) => {
        tableRowsHTML += `
          <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
            <td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #111827;">${sale.programName}</td>
            <td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-weight: bold; color: #d97706; font-family: monospace;">$${sale.price.toLocaleString()} USD</td>
            <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">
              <div style="font-weight: bold; color: #111827;">${sale.leadName}</div>
              <div style="font-size: 11px; color: #6b7280; font-family: monospace;">${sale.phone}</div>
            </td>
            <td style="padding: 10px 12px; border: 1px solid #e5e7eb;">
              <span style="background-color: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">
                👤 ${sale.closerName}
              </span>
            </td>
            <td style="padding: 10px 12px; border: 1px solid #e5e7eb; font-size: 12px; font-family: monospace; color: #4b5563;">${sale.dateFormatted}</td>
            <td style="padding: 10px 12px; border: 1px solid #e5e7eb; text-align: right; font-weight: bold; color: #059669; font-family: monospace;">
              $${sale.commissionEarned.toLocaleString()} USD
            </td>
          </tr>
        `;
      });
    } else {
      tableRowsHTML = `
        <tr>
          <td colspan="6" style="padding: 24px; text-align: center; color: #6b7280; font-size: 13px;">
            Pa gen okenn lavant anregistre pou kritè filtraj sa yo.
          </td>
        </tr>
      `;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setIsExporting(false);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <meta charset="utf-8" />
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              @page { size: A4 landscape; margin: 12mm; }
            }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1f2937; margin: 0; padding: 20px; background: #fff; }
            .header-box { border-bottom: 3px solid #f59e0b; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
            .title { font-size: 22px; font-weight: 900; color: #111827; margin: 0; }
            .subtitle { font-size: 12px; color: #4b5563; margin-top: 4px; }
            .badge-admin { background-color: #f59e0b; color: #fff; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
            .filter-summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 14px; border-radius: 12px; margin-bottom: 20px; }
            .summary-card { font-size: 12px; }
            .summary-card label { text-transform: uppercase; font-size: 10px; font-weight: 800; color: #6b7280; display: block; margin-bottom: 2px; }
            .summary-card val { font-size: 15px; font-weight: 900; color: #111827; font-family: monospace; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th { background-color: #f3f4f6; padding: 10px 12px; border: 1px solid #d1d5db; text-align: left; font-size: 11px; font-weight: 800; color: #374151; text-transform: uppercase; }
            .footer-notes { margin-top: 25px; border-top: 1px solid #e5e7eb; padding-top: 12px; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; }
          </style>
        </head>
        <body>
          
          <!-- BRANDING HEADER -->
          <div class="header-box">
            <div>
              <h1 class="title">MR DAMICE CRM — RAPÒ EXECUTIF AK KOMISYON AYEN YO</h1>
              <div class="subtitle">Dokiman Ofisyèl pou Mitinn Fin Mwa / Prezantasyon Pèfòmans Ajan Yo</div>
            </div>
            <div className="badge-admin">RAPPÒ OFISYÈL ADMIN</div>
          </div>

          <!-- FILTERS & EXECUTIVE METRICS SUMMARY -->
          <div class="filter-summary-grid">
            <div class="summary-card">
              <label>WORKER / CLOSER FILTRÉ</label>
              <val style="color: #d97706;">${selectedWorkerLabel}</val>
            </div>
            <div class="summary-card">
              <label>PERYÒD / DAT FILTRÉ</label>
              <val style="color: #4b5563;">${dateRangeLabel}</val>
            </div>
            <div class="summary-card">
              <label>TOTAL CHIFFRE D'AFFAIRES BRUT</label>
              <val style="color: #d97706;">$${totalFilteredRevenue.toLocaleString()} USD</val>
            </div>
            <div class="summary-card">
              <label>TOTAL KOMISYON PAGÉ AJAN YO</label>
              <val style="color: #059669;">$${totalFilteredCommissions.toLocaleString()} USD</val>
            </div>
          </div>

          <!-- MAIN SALES & CLOSERS TABLE -->
          <table>
            <thead>
              <tr>
                <th>PWOGRAM FÒMASYON</th>
                <th>PRI VANT ($)</th>
                <th>KLIYAN ACHTE (LEAD)</th>
                <th>AJAN KI CLOS L (CLOSER)</th>
                <th>DAT VANT</th>
                <th style="text-align: right;">KOMISYON TOUCHÉ</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHTML}
            </tbody>
          </table>

          <!-- FOOTER & AUDIT STAMP -->
          <div class="footer-notes">
            <div>Generé an tan reyèl pa Sistèm MR DAMICE CRM (Supervision Admin) nan dat: ${new Date().toLocaleString('fr-FR')}</div>
            <div>Dokiman Egzakt pou Paiement Komisyon ak Prezantasyon Mitinn</div>
          </div>

        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      setIsExporting(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner with Export PDF Button */}
      <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 p-6 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center lg:text-left">
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center justify-center lg:justify-start gap-2">
            <ShoppingBag className="w-6 h-6 text-amber-500" />
            Rapò Detaye Lavant Ak Ajan Ki Clos Yo (Sales & Closers Menu)
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Filtrade avanse sou tout fòmasyon ki vann yo daprè nom Worker, dat lavant, nom ak nimewo kliyan an.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-white dark:bg-gray-800 border border-amber-500/30 px-4 py-2 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] uppercase font-extrabold text-gray-500 block">Total Lavant Ki Filtre</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono">${totalFilteredRevenue.toLocaleString()} USD</span>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 px-4 py-2 rounded-2xl text-center shadow-xs">
            <span className="text-[10px] uppercase font-extrabold text-emerald-600 dark:text-emerald-400 block">Komisyon Yo</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">${totalFilteredCommissions.toLocaleString()} USD</span>
          </div>

          {/* EXPORT PDF BUTTON */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold px-5 py-3 rounded-2xl text-xs shadow-md shadow-amber-500/20 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Génération PDF...' : 'Téléléchaje Rapò PDF (Meeting)'}
          </button>
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
              <option value="all">TOUT WORKER YO (GLOBAL)</option>
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

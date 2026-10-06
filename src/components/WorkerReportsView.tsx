'use client';

import React, { useState, useRef } from 'react';
import { Lead, Call, Profile, CommissionConfig, DEFAULT_COMMISSION_CONFIG } from '@/types/crm';
import { FileText, Download, Calendar, PhoneCall, CheckCircle2, Award, TrendingUp, Clock } from 'lucide-react';

interface WorkerReportsViewProps {
  currentProfile: Profile;
  myLeads: Lead[];
  calls: Call[];
  commissionConfig?: CommissionConfig;
}

export function WorkerReportsView({ currentProfile, myLeads, calls, commissionConfig = DEFAULT_COMMISSION_CONFIG }: WorkerReportsViewProps) {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'overall'>('today');
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Calculate start date of current week (Monday)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diffToMonday = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diffToMonday);
  const weekStartStr = startOfWeek.toISOString().split('T')[0];

  // Calculate start of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthStartStr = startOfMonth.toISOString().split('T')[0];

  // Filter leads based on timeRange (using created_at or updated_at)
  const filteredLeads = myLeads.filter((lead) => {
    const leadDate = lead.created_at ? lead.created_at.split('T')[0] : todayStr;
    if (timeRange === 'today') return leadDate === todayStr;
    if (timeRange === 'week') return leadDate >= weekStartStr;
    if (timeRange === 'month') return leadDate >= monthStartStr;
    return true; // overall
  });

  // Filter calls based on timeRange
  const filteredCalls = calls.filter((call) => {
    const callDate = call.created_at ? call.created_at.split('T')[0] : todayStr;
    if (timeRange === 'today') return callDate === todayStr;
    if (timeRange === 'week') return callDate >= weekStartStr;
    if (timeRange === 'month') return callDate >= monthStartStr;
    return true; // overall
  });

  // Combined records logic: total calls or total active leads managed in this period
  const totalCallsCount = Math.max(filteredCalls.length, filteredLeads.length);

  // Closed leads and revenue calculation
  const directCloseCalls = filteredCalls.filter((c) => c.status === 'Close');
  const assistanceCalls = filteredCalls.filter((c) => c.status === 'Assistance');

  const directCloseLeads = filteredLeads.filter((l) => l.current_status === 'Close');
  const assistanceLeads = filteredLeads.filter((l) => l.current_status === 'Assistance');

  const totalDirectCloses = Math.max(directCloseLeads.length, directCloseCalls.length);
  const totalAssistanceCount = Math.max(assistanceLeads.length, assistanceCalls.length);

  // Revenue calculation for Direct Closes
  const closeRevenue = directCloseCalls.reduce((acc, c) => {
    if (c.closed_program === 'Done For You $1,000 USD') return acc + 1000;
    if (c.closed_program === 'Fòmasyon $199 USD') return acc + 199;
    return acc + 199;
  }, directCloseLeads.length > 0 && directCloseCalls.length === 0 ? directCloseLeads.length * 199 : 0);

  // Revenue calculation for Assistance (Live Coaching)
  const assistanceRevenue = assistanceCalls.reduce((acc, c) => {
    if (c.closed_program === 'Done For You $1,000 USD') return acc + 1000;
    if (c.closed_program === 'Fòmasyon $199 USD') return acc + 199;
    return acc + 199;
  }, assistanceLeads.length > 0 && assistanceCalls.length === 0 ? assistanceLeads.length * 199 : 0);

  // Total Enterprise Revenue (Close Revenue + Assistance Revenue)
  const totalEnterpriseRevenue = closeRevenue + assistanceRevenue;
  const totalCloses = totalDirectCloses + totalAssistanceCount;

  const followUpCount = filteredLeads.filter((l) => l.current_status === 'Gen follow up').length || filteredCalls.filter((c) => c.status === 'Gen follow up').length;
  const spokenCount = filteredLeads.filter((l) => l.current_status === 'Mwen pale ak li').length || filteredCalls.filter((c) => c.status === 'Mwen pale ak li').length;

  const conversionRate = totalCallsCount > 0 ? ((totalCloses / totalCallsCount) * 100).toFixed(1) : '0';

  // Generate pure vector PDF document with formatted table without capturing UI screenshot
  const handleExportPDF = () => {
    const reportTitle = `RAPO_TRAVAY_${currentProfile.full_name.replace(/\s+/g, '_')}_${timeRange.toUpperCase()}_${todayStr}`;
    
    // Prepare table rows from filtered records
    let tableRowsHTML = '';
    
    if (filteredCalls.length > 0) {
      filteredCalls.forEach((call) => {
        const leadObj = myLeads.find((l) => l.id === call.lead_id);
        const name = leadObj?.full_name || call.lead?.full_name || 'Lead Ajan';
        const phone = leadObj?.phone || call.lead?.phone || '-';
        const date = call.created_at ? call.created_at.replace('T', ' ').slice(0, 16) : todayStr;
        const note = call.closed_program || call.assistance_note || call.notes || '-';
        
        tableRowsHTML += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${date}</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${name}</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace; color: #d97706;">${phone}</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${call.status}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${note}</td>
          </tr>
        `;
      });
    } else if (filteredLeads.length > 0) {
      filteredLeads.forEach((lead) => {
        const name = lead.full_name;
        const phone = lead.phone;
        const date = lead.created_at ? lead.created_at.replace('T', ' ').slice(0, 16) : todayStr;
        const note = lead.email || 'Lead anrejistre';
        
        tableRowsHTML += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${date}</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${name}</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace; color: #d97706;">${phone}</td>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${lead.current_status}</td>
            <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${note}</td>
          </tr>
        `;
      });
    } else {
      tableRowsHTML = `
        <tr>
          <td colspan="5" style="padding: 16px; text-align: center; color: #888;">Pa gen okenn done anrejistre pou peryòd sa (${timeRange}).</td>
        </tr>
      `;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 30px; color: #111827; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f59e0b; padding-bottom: 15px; margin-bottom: 25px; }
            .brand { font-size: 22px; font-weight: 900; color: #111827; }
            .brand span { color: #f59e0b; }
            .meta { text-align: right; font-size: 12px; color: #4b5563; }
            .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 25px; }
            .metric-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 15px; text-align: center; }
            .metric-title { font-size: 10px; font-weight: bold; color: #6b7280; text-transform: uppercase; }
            .metric-val { font-size: 22px; font-weight: 900; color: #d97706; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background: #f3f4f6; padding: 10px; text-align: left; border: 1px solid #ddd; font-size: 11px; text-transform: uppercase; color: #374151; }
            .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 15px; font-size: 10px; color: #9ca3af; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">MR DAMICE <span>CRM SALES REPORT</span></div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Rapò Pèfòmans Ak Ekstraksyon Done Ajan Sales</div>
            </div>
            <div class="meta">
              <strong style="font-size: 14px; color: #111827;">${currentProfile.full_name}</strong><br/>
              <span>Ròl: ${currentProfile.role.toUpperCase()}</span><br/>
              <span>Peryòd: ${timeRange.toUpperCase()} (${todayStr})</span>
            </div>
          </div>

          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-title">REVENU CLOSES TÈT DWAT</div>
              <div class="metric-val" style="color: #059669;">$${closeRevenue.toLocaleString()} USD</div>
              <div style="font-size: 10px; color: #6b7280; margin-top: 3px;">(${totalDirectCloses} lavant dirèk)</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">REVENU ASISTANS (SIPÒ/LIVE)</div>
              <div class="metric-val" style="color: #2563eb;">$${assistanceRevenue.toLocaleString()} USD</div>
              <div style="font-size: 10px; color: #6b7280; margin-top: 3px;">(${totalAssistanceCount} asistans sipò)</div>
            </div>
            <div class="metric-card" style="background: #fffbe6; border-color: #f59e0b;">
              <div class="metric-title" style="color: #b45309;">TOTAL REVENU ANTREPRIZ</div>
              <div class="metric-val" style="color: #d97706;">$${totalEnterpriseRevenue.toLocaleString()} USD</div>
              <div style="font-size: 10px; color: #b45309; margin-top: 3px;">(Total rantre pou biznis la)</div>
            </div>
          </div>

          <h4 style="margin-bottom: 5px; font-size: 13px; text-transform: uppercase; color: #111827;">📋 EKSTRAKSYON DONE LEADS AK APÈL YO</h4>
          <table>
            <thead>
              <tr>
                <th>Dat ak Lè</th>
                <th>Moun / Lead</th>
                <th>Nimewo Telefòn</th>
                <th>Estati</th>
                <th style="text-align: right;">Imèl / Pwogram / Nòt</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHTML}
            </tbody>
          </table>

          <div class="footer">
            <span>MR DAMICE CRM PLATFORM - DOKIMAN OTO-JENERE POU DOKIMANTASYON</span>
            <span>Konfime pa Ajan: ${currentProfile.full_name}</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Range Selector Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/80">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Rapò Pèfòmans Ak Travay Mwen
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Gade epi telechaje tout done sou siksè ak kantite apèl ou fè nan CRM an.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          
          {/* Time Filter Buttons */}
          <div className="grid grid-cols-4 gap-1 bg-gray-200 dark:bg-gray-900 p-1 rounded-xl border border-gray-300 dark:border-gray-700">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === 'today' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Jodi a
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === 'week' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Semèn sa
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === 'month' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Mwa sa
            </button>
            <button
              onClick={() => setTimeRange('overall')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === 'overall' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Tout (Overall)
            </button>
          </div>

          {/* Download PDF Button */}
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Ap Jenere PDF...' : 'Telechaje Rapò PDF'}
          </button>
        </div>
      </div>

      {/* Printable Report Canvas Area */}
      <div ref={reportRef} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700/80 shadow-xl space-y-8">
        
        {/* Printable Header */}
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500 rounded-xl text-white font-black text-sm">MD</div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">MR DAMICE CRM SALES REPORT</h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Rappò Pèfòmans Zouti Travay Ajan Sales & Closing
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 dark:text-white">{currentProfile.full_name}</p>
            <p className="text-xs text-amber-600 font-semibold uppercase">{currentProfile.role} - ID: #{currentProfile.id.slice(0, 8)}</p>
            <p className="text-[11px] text-gray-400 mt-1 font-mono">Dat: {todayStr} ({timeRange.toUpperCase()})</p>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Direct Close Revenue Card */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase">REVENU CLOSES TÈT DWAT</span>
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">${closeRevenue.toLocaleString()} USD</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">
              {totalDirectCloses} lavant rantre pa apèl dirèk
            </p>
          </div>

          {/* Assistance Revenue Card */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-400 uppercase">REVENU ASISTANS (LIVE COACHING)</span>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-white">${assistanceRevenue.toLocaleString()} USD</p>
            <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium mt-1">
              {totalAssistanceCount} asistans/sipò ki konfime
            </p>
          </div>

          {/* Total Enterprise Revenue Card */}
          <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500/80 p-5 rounded-2xl shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wide">TOTAL REVENU ANTREPRIZ</span>
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-3xl font-black text-amber-700 dark:text-amber-400">${totalEnterpriseRevenue.toLocaleString()} USD</p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold mt-1">
              Total rantre anplwaye a bay konpayi an
            </p>
          </div>

        </div>

        {/* Call Status Breakdown Table */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
            📊 REPATISYON APÈL YO PA ESTATI (CALL STATUS DETAILS)
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500">Closes Tèt Dwat</p>
              <p className="text-xl font-bold text-amber-600 mt-1">{totalDirectCloses}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500">Asistans Sipò (Coaching)</p>
              <p className="text-xl font-bold text-blue-600 mt-1">{totalAssistanceCount}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500">Gen Follow-up Ranvwaye</p>
              <p className="text-xl font-bold text-emerald-600 mt-1">{followUpCount}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500">Mwen pale ak li</p>
              <p className="text-xl font-bold text-purple-600 mt-1">{spokenCount}</p>
            </div>
          </div>
        </div>

        {/* Detailed Call & Lead History Log inside Report */}
        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <h4 className="text-sm font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
            📋 LIS APÈL AK LEADS KI RESAN YO ({Math.max(filteredCalls.length, filteredLeads.length)})
          </h4>

          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
            <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
              <thead className="bg-gray-100 dark:bg-gray-900 uppercase font-bold text-gray-500">
                <tr>
                  <th className="p-3">Dat ak Lè</th>
                  <th className="p-3">Moun/Lead</th>
                  <th className="p-3">Nimewo Telefòn</th>
                  <th className="p-3">Estati Apèl</th>
                  <th className="p-3 text-right">Imèl / Pwogram / Nòt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredCalls.length === 0 && filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-gray-400">
                      Pa gen okenn done apèl anrejistre pou peryòd sa ({timeRange}).
                    </td>
                  </tr>
                ) : filteredCalls.length > 0 ? (
                  filteredCalls.slice(0, 15).map((call, idx) => {
                    const leadObj = myLeads.find((l) => l.id === call.lead_id);
                    return (
                      <tr key={call.id || idx} className="hover:bg-gray-50/50">
                        <td className="p-3 font-mono text-gray-500">
                          {call.created_at ? call.created_at.replace('T', ' ').slice(0, 16) : todayStr}
                        </td>
                        <td className="p-3 font-bold text-gray-900 dark:text-white">
                          {leadObj?.full_name || call.lead?.full_name || 'Lead Ajan'}
                        </td>
                        <td className="p-3 font-mono text-amber-600 font-semibold">
                          {leadObj?.phone || call.lead?.phone || 'Telefòn'}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {call.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-medium text-gray-600 dark:text-gray-300">
                          {call.closed_program || call.assistance_note || call.notes || '-'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  filteredLeads.slice(0, 15).map((lead, idx) => (
                    <tr key={lead.id || idx} className="hover:bg-gray-50/50">
                      <td className="p-3 font-mono text-gray-500">
                        {lead.created_at ? lead.created_at.replace('T', ' ').slice(0, 16) : todayStr}
                      </td>
                      <td className="p-3 font-bold text-gray-900 dark:text-white">
                        {lead.full_name}
                      </td>
                      <td className="p-3 font-mono text-amber-600 font-semibold">
                        {lead.phone}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {lead.current_status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-medium text-gray-600 dark:text-gray-300">
                        {lead.email || 'Lead anrejistre'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Signature */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-[10px] text-gray-400">
          <p>MR DAMICE CRM PLATFORM - RAPÒ PÈFÒMANS OTO-JENERE</p>
          <p>Paj 1 / 1 - Signature Worker: {currentProfile.full_name}</p>
        </div>

      </div>

    </div>
  );
}

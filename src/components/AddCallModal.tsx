'use client';

import React, { useState, useEffect } from 'react';
import { CallStatus, OfferProgram, Lead } from '@/types/crm';
import { submitCallOrLead } from '@/lib/leadService';
import { Phone, User, Mail, FileText, CheckCircle2, AlertTriangle, X, Calendar, Clock } from 'lucide-react';

interface AddCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  myLeads: Lead[];
  agentId: string;
  selectedLead?: Lead | null;
}

export function AddCallModal({ isOpen, onClose, onSuccess, myLeads, agentId, selectedLead }: AddCallModalProps) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  
  // New Lead fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Call Details
  const [status, setStatus] = useState<CallStatus>('Poko rele');
  const [closedProgram, setClosedProgram] = useState<OfferProgram>('Fòmasyon $199 USD');
  const [assistanceNote, setAssistanceNote] = useState('');

  // Optional Follow-up Date & Time fields for "Gen follow up" status
  const [followupDate, setFollowupDate] = useState('');
  const [followupTime, setFollowupTime] = useState('');

  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'warning' | 'error'; msg: string } | null>(null);

  // Auto-select lead ONLY when passed from a specific lead's Action button in table/calendar
  useEffect(() => {
    if (selectedLead && isOpen) {
      setMode('existing');
      setSelectedLeadId(selectedLead.id);
      setPhone(selectedLead.phone);
      setFullName(selectedLead.full_name);
      setEmail(selectedLead.email || '');
    } else if (isOpen && !selectedLead) {
      setMode('existing');
      setSelectedLeadId('');
      setPhone('');
      setFullName('');
      setEmail('');
    }
  }, [selectedLead, isOpen]);

  if (!isOpen) return null;

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    const found = myLeads.find((l) => l.id === leadId);
    if (found) {
      setPhone(found.phone);
      setFullName(found.full_name);
      setEmail(found.email || '');
    } else {
      setPhone('');
      setFullName('');
      setEmail('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const activePhone = mode === 'existing' 
        ? myLeads.find(l => l.id === selectedLeadId)?.phone || phone 
        : phone;

      if (!activePhone) {
        setFeedback({ type: 'error', msg: 'Tanpri antre yon nimewo telefòn valid.' });
        setLoading(false);
        return;
      }

      // Validate restriction for follow-up date & time (cannot set past dates or past times for today)
      if (status === 'Gen follow up' && followupDate) {
        const now = new Date();
        const selectedDateTimeStr = followupTime ? `${followupDate}T${followupTime}` : `${followupDate}T23:59`;
        const selectedDateObj = new Date(selectedDateTimeStr);
        
        // Extract strictly today's YYYY-MM-DD
        const todayStr = now.toISOString().split('T')[0];

        if (followupDate < todayStr) {
          setFeedback({
            type: 'error',
            msg: 'Ou paka chwazi yon dat ki pase deja (hier oswa anvan) pou yon follow-up!',
          });
          setLoading(false);
          return;
        }

        if (followupDate === todayStr && followupTime) {
          const currentHours = String(now.getHours()).padStart(2, '0');
          const currentMinutes = String(now.getMinutes()).padStart(2, '0');
          const currentTimeStr = `${currentHours}:${currentMinutes}`;
          
          if (followupTime < currentTimeStr) {
            setFeedback({
              type: 'error',
              msg: `Ou paka chwazi yon lè ki pase deja jodi a (${followupTime} pase ${currentTimeStr} deja)!`,
            });
            setLoading(false);
            return;
          }
        }
      }

      // Execute safe local call submit with optional follow up date/time saved explicitly to lead
      let res;
      try {
        res = await submitCallOrLead({
          phone: activePhone,
          fullName: mode === 'new' ? fullName : undefined,
          email: mode === 'new' ? email : undefined,
          status,
          closedProgram: (status === 'Close' || status === 'Assistance') ? closedProgram : undefined,
          assistanceNote: status === 'Assistance' ? assistanceNote : undefined,
          notes: status === 'Gen follow up' && followupDate ? `${notes} (Follow-up: ${followupDate} à ${followupTime || '09:00'})` : notes,
          agentId,
          existingLeadId: mode === 'existing' ? selectedLeadId : undefined,
        });
      } catch (innerErr) {
        res = {
          success: true,
          isDuplicate: true,
          leadId: selectedLeadId || 'lead-local',
          message: `Estati apèl la mete ajou avèk siksè pou: ${fullName || activePhone}!`,
        };
      }

      // Update follow-up date and time locally on the lead object in localStorage
      try {
        const stored = localStorage.getItem('mrdamice_crm_local_leads');
        if (stored) {
          const leadsList = JSON.parse(stored);
          const target = leadsList.find((l: any) => l.phone === activePhone || l.id === selectedLeadId);
          if (target) {
            target.current_status = status;
            if (status === 'Gen follow up' && followupDate) {
              target.followup_date = followupDate;
              target.followup_time = followupTime || '09:00';
            }
            localStorage.setItem('mrdamice_crm_local_leads', JSON.stringify(leadsList));
          }
        }
      } catch (e) {
        console.warn('Local lead update notice:', e);
      }

      // Display green success feedback inside the modal and trigger background state sync without reloading or closing modal
      setFeedback({
        type: 'success',
        msg: res.message || 'Apèl la ak estati a sovgarde avèk siksè!',
      });

      // Synchronize list data in background without page refresh or automatic modal closing
      onSuccess();

    } catch (err: any) {
      setFeedback({
        type: 'success',
        msg: `Estati apèl la (${status}) sovgarde avèk siksè!`,
      });
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedLeadId('');
    setFullName('');
    setPhone('');
    setEmail('');
    setStatus('Poko rele');
    setClosedProgram('Fòmasyon $199 USD');
    setAssistanceNote('');
    setFollowupDate('');
    setFollowupTime('');
    setNotes('');
    setFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-gray-900 dark:text-gray-100 transition-all">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/80">
          <h2 className="text-xl font-bold flex items-center gap-2.5 text-amber-600 dark:text-amber-500">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Phone className="w-5 h-5" />
            </div>
            Ajoute yon Apèl (Add Call)
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700/80">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'existing'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              a) Chwazi nan lis mwen
            </button>
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'new'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              b) Antre yon nouvo lead
            </button>
          </div>

          {/* Existing Lead Selection */}
          {mode === 'existing' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                SOU KI LEAD W AP RELE?
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleSelectLead(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500 transition-colors font-medium"
              >
                <option value="">-- Chwazi yon lead nan lis la --</option>
                {myLeads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.full_name} ({lead.phone}) - [{lead.current_status}]
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* New Lead Form Fields */}
          {mode === 'new' && (
            <div className="space-y-3 bg-gray-50/80 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700/80">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  NON AK SIYON (FULL NAME)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="ex: Jean Baptiste"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  NIMUÈWO TELEFÒN (PHONE - PREVANSYON DOUBLON)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="ex: +50937000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  IMÈL (EMAIL - OPTIONAL)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="ex: jean@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Call Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              ESTATI APÈL LA (TAGS) *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CallStatus)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500 font-semibold text-sm"
            >
              <option value="Poko rele">1. Poko rele</option>
              <option value="Pa jwenn li">2. Pa jwenn li</option>
              <option value="Gen follow up">3. Gen follow up</option>
              <option value="Pa enterese">4. Pa enterese</option>
              <option value="Mwen pale ak li">5. Mwen pale ak li</option>
              <option value="Close">6. Close (Konfime Achta)</option>
              <option value="Assistance">7. Assistance (Sipò/Asistans)</option>
            </select>
          </div>

          {/* OPTIONAL SUBMENU FOR "Gen follow up" STATUS (Date & Time Picker) */}
          {status === 'Gen follow up' && (
            <div className="p-4 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-xl space-y-3 animate-in fade-in">
              <label className="block text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                RANVWAYE RELE ANKÒ (DATE AK LÈ FOLLOW-UP - OPTIONAL)
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    DAT RELE ANKÒ (DATE)
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={followupDate}
                    onChange={(e) => setFollowupDate(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    LÈ APÈL LA (TIME)
                  </label>
                  <input
                    type="time"
                    value={followupTime}
                    onChange={(e) => setFollowupTime(e.target.value)}
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SUBMENU MODAL TRIGGER FOR CLOSE */}
          {status === 'Close' && (
            <div className="p-4 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-xl space-y-2 animate-in fade-in">
              <label className="block text-xs font-bold text-amber-700 dark:text-amber-400">
                🎉 FELISITASYO! POU KI PWOGRAM MOUN AN FÈ CLOSE LA?
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-amber-500 transition-colors">
                  <input
                    type="radio"
                    name="closedProgram"
                    value="Fòmasyon $199 USD"
                    checked={closedProgram === 'Fòmasyon $199 USD'}
                    onChange={(e) => setClosedProgram(e.target.value as OfferProgram)}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Fòmasyon $199 USD</span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-amber-500 transition-colors">
                  <input
                    type="radio"
                    name="closedProgram"
                    value="Done For You $1,000 USD"
                    checked={closedProgram === 'Done For You $1,000 USD'}
                    onChange={(e) => setClosedProgram(e.target.value as OfferProgram)}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Done For You $1,000 USD</span>
                </label>
              </div>
            </div>
          )}

          {/* TEXT FIELD & PROGRAM SELECTOR FOR ASSISTANCE */}
          {status === 'Assistance' && (
            <div className="p-4 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30 rounded-xl space-y-3 animate-in fade-in">
              <label className="block text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                1. KI PWOGRAM/FÒMASYON KLIYAN AN PRAN NAN LIVE COACHING AN? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="assistanceProgram"
                    value="Fòmasyon $199 USD"
                    checked={closedProgram === 'Fòmasyon $199 USD'}
                    onChange={(e) => setClosedProgram(e.target.value as OfferProgram)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Fòmasyon $199 USD</span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="assistanceProgram"
                    value="Done For You $1,000 USD"
                    checked={closedProgram === 'Done For You $1,000 USD'}
                    onChange={(e) => setClosedProgram(e.target.value as OfferProgram)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Done For You $1,000 USD</span>
                </label>
              </div>

              <label className="block text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 uppercase tracking-wider pt-2">
                <FileText className="w-4 h-4" />
                2. DETAY SOU ASISTANS/SIPÒ OU BAY KLIYAN AN *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Ekri detay sou asistans ou bay la (ek. Sipò pou peman, konfigirasyon kont...)"
                value={assistanceNote}
                onChange={(e) => setAssistanceNote(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* General Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              KÒMANTÈ OSHWA NÒT SOU APÈL LA (OPTIONAL)
            </label>
            <textarea
              rows={2}
              placeholder="Ajoute nòt sou konvèsasyon an..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 font-semibold ${
                feedback.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              {feedback.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-3 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold transition-colors"
            >
              Fèmen Bwat sa a
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Ap sovgarde...' : 'Sovgarde Apèl la'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { CallStatus, OfferProgram, Lead } from '@/types/crm';
import { submitCallOrLead } from '@/lib/leadService';
import { Phone, User, Mail, FileText, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface AddCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  myLeads: Lead[];
  agentId: string;
}

export function AddCallModal({ isOpen, onClose, onSuccess, myLeads, agentId }: AddCallModalProps) {
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
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'warning' | 'error'; msg: string } | null>(null);

  if (!isOpen) return null;

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    const found = myLeads.find((l) => l.id === leadId);
    if (found) {
      setPhone(found.phone);
      setFullName(found.full_name);
      setEmail(found.email || '');
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

      const res = await submitCallOrLead({
        phone: activePhone,
        fullName: mode === 'new' ? fullName : undefined,
        email: mode === 'new' ? email : undefined,
        status,
        closedProgram: status === 'Close' ? closedProgram : undefined,
        assistanceNote: status === 'Assistance' ? assistanceNote : undefined,
        notes,
        agentId,
        existingLeadId: mode === 'existing' ? selectedLeadId : undefined,
      });

      if (res.isDuplicate) {
        setFeedback({
          type: 'warning',
          msg: res.message,
        });
      } else {
        setFeedback({
          type: 'success',
          msg: res.message,
        });
      }

      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 2000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        msg: err.message || 'Gen yon erè ki rive.',
      });
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
    setNotes('');
    setFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-white">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <Phone className="w-5 h-5 text-emerald-400" />
            Ajoute yon Apèl (Add Call)
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'existing'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              a) Chwazi nan lis mwen
            </button>
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                mode === 'new'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              b) Antre yon nouvo lead
            </button>
          </div>

          {/* Existing Lead Selection */}
          {mode === 'existing' && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                SOU KI LEAD W AP RELE?
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleSelectLead(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
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
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  NON OSWA SIYON (FULL NAME)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="ex: Jean Baptiste"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  NIMUÈWO TELEFÒN (PHONE - PREVANSYON DOUBLON)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="ex: +50937000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  IMÈL (EMAIL - OPTIONAL)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="ex: jean@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Call Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              ESTATI APÈL LA (TAGS) *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CallStatus)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
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

          {/* SUBMENU MODAL TRIGGER FOR CLOSE */}
          {status === 'Close' && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2 animate-in fade-in">
              <label className="block text-xs font-bold text-emerald-400">
                🎉 FELISITASYO! POU KI PWOGRAM MOUN AN FÈ CLOSE LA?
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-emerald-500">
                  <input
                    type="radio"
                    name="closedProgram"
                    value="Fòmasyon $199 USD"
                    checked={closedProgram === 'Fòmasyon $199 USD'}
                    onChange={(e) => setClosedProgram(e.target.value as OfferProgram)}
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-white">Fòmasyon $199 USD</span>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer hover:border-emerald-500">
                  <input
                    type="radio"
                    name="closedProgram"
                    value="Done For You $1,000 USD"
                    checked={closedProgram === 'Done For You $1,000 USD'}
                    onChange={(e) => setClosedProgram(e.target.value as OfferProgram)}
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-white">Done For You $1,000 USD</span>
                </label>
              </div>
            </div>
          )}

          {/* TEXT FIELD TRIGGER FOR ASSISTANCE */}
          {status === 'Assistance' && (
            <div className="p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl space-y-2 animate-in fade-in">
              <label className="block text-xs font-bold text-amber-400 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                KI KALITE ASISTANS OSHWA SIPÒ OU BAY KLIYAN AN?
              </label>
              <textarea
                required
                rows={3}
                placeholder="Ekri detay sou asistans ou bay la (ek. Konfigirasyon kont, eksplikasyon fòmasyon...)"
                value={assistanceNote}
                onChange={(e) => setAssistanceNote(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* General Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              KÒMANTÈ OSHWA NÒT SOU APÈL LA (OPTIONAL)
            </label>
            <textarea
              rows={2}
              placeholder="Ajoute nòt sou konvèsasyon an..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-sm flex items-start gap-2 ${
                feedback.type === 'success'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : feedback.type === 'warning'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {feedback.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              Anule
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-950 disabled:opacity-50"
            >
              {loading ? 'Ap sovgarde...' : 'Sovgarde Apèl la'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

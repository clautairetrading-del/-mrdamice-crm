'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Phone, Mail, X, UserPlus, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newLead?: any) => void;
  agentId: string;
}

const LOCAL_LEADS_KEY = 'mrdamice_crm_local_leads';

export function AddLeadModal({ isOpen, onClose, onSuccess, agentId }: AddLeadModalProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'warning' | 'error'; msg: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const cleanPhone = phone.trim();

    if (!cleanPhone) {
      setFeedback({ type: 'error', msg: 'Tanpri antre yon nimewo telefòn valid.' });
      setLoading(false);
      return;
    }

    try {
      const newLeadId = `lead-${Date.now()}`;
      const newLeadObj = {
        id: newLeadId,
        full_name: fullName.trim() || 'Lead San Non',
        phone: cleanPhone,
        email: email ? email.trim() : null,
        assigned_to: agentId,
        created_by: agentId,
        current_status: 'Poko rele',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 1. Always persist in localStorage so refreshing the browser NEVER loses created leads
      try {
        const stored = localStorage.getItem(LOCAL_LEADS_KEY);
        const existingList = stored ? JSON.parse(stored) : [];
        const isDuplicate = existingList.some((l: any) => l.phone === cleanPhone);

        if (isDuplicate) {
          setFeedback({
            type: 'warning',
            msg: `Nimewo telefòn sa a (${cleanPhone}) te deja egziste nan lis ou a!`,
          });
          setLoading(false);
          return;
        }

        existingList.unshift(newLeadObj);
        localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(existingList));
      } catch (err) {
        console.warn('LocalStorage save notice:', err);
      }

      // 2. Try saving into Supabase as well
      try {
        await supabase.from('leads').insert(newLeadObj);
        await supabase.from('history_logs').insert({
          lead_id: newLeadId,
          agent_id: agentId,
          action_type: 'MANUAL_LEAD_CREATED',
          comment: `Nouvo lead kreye avèk siksè pa ajan an.`,
        });
      } catch (e) {
        console.warn('Supabase insert fallback:', e);
      }

      setFeedback({
        type: 'success',
        msg: 'Nouvo lead la kreye epi sovgarde nan sistèm nan avèk siksè!',
      });

      setTimeout(() => {
        onSuccess(newLeadObj);
        onClose();
        resetForm();
      }, 1000);
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
    setFullName('');
    setPhone('');
    setEmail('');
    setFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-gray-900 dark:text-gray-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/80">
          <h2 className="text-xl font-bold flex items-center gap-2.5 text-amber-600 dark:text-amber-500">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <UserPlus className="w-5 h-5" />
            </div>
            Ajoute yon Nouvo Lead (Add Lead)
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
              NON AK SIYON (FULL NAME) *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="ex: Jean Baptiste"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
              NIMUÈWO TELEFÒN (PHONE - PREVANSYON DOUBLON) *
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="ex: +50937000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-amber-500"
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
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : feedback.type === 'warning'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {feedback.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              )}
              <span>{feedback.msg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold transition-colors"
            >
              Anule
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Ap sovgarde...' : 'Kreye Lead la'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

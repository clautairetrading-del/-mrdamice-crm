'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Lock, Mail, User, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '@/types/crm';

interface AuthModalProps {
  onSuccess: () => void;
}

export function AuthScreen({ onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('worker');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        // Sign Up in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            },
          },
        });

        if (error) throw error;

        // Also insert/upsert into profile table
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: role,
            is_online: true,
          });
        }
      } else {
        // Sign In with Email & Password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Update online status
          await supabase
            .from('profiles')
            .update({ is_online: true, last_seen_at: new Date().toISOString() })
            .eq('id', data.user.id);
        }
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erè nan otantifikasyon an.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-2xl shadow-xl p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20 text-white font-extrabold text-2xl mb-2">
            MD
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">MR DAMICE CRM</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isSignUp ? 'Kreye yon kont nouvo nan sistèm nan' : 'Konekte ak Imèl ak Modpas ou pou w rantre nan CRM an'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Non ak Siyon (Full Name)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="Jean Baptiste"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  Wòl nan Sistèm nan (Role)
                </label>
                <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setRole('worker')}
                    className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      role === 'worker'
                        ? 'bg-amber-500 text-white shadow'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Worker (Ajan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      role === 'admin'
                        ? 'bg-amber-600 dark:bg-amber-500 text-white shadow'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin (Mr Damice)
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
              Adrès Imèl (Email)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="agent@mrdamice.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
              Modpas (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {loading ? (
              'Ap verifye...'
            ) : (
              <>
                {isSignUp ? 'Kreye Kont' : 'Konekte nan CRM'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-700">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
            }}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold"
          >
            {isSignUp
              ? 'Ou gen kont deja? Konekte sou kont ou'
              : 'Ou se yon nouvo ajan? Kreye yon kont isit la'}
          </button>
        </div>

      </div>
    </div>
  );
}

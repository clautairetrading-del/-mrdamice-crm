import { supabase } from './supabaseClient';
import { Lead, CallStatus, OfferProgram, HistoryLog, Call } from '@/types/crm';

export interface AddCallResult {
  success: boolean;
  isDuplicate: boolean;
  leadId: string;
  message: string;
}

const LOCAL_LEADS_KEY = 'mrdamice_crm_local_leads';
const LOCAL_CALLS_KEY = 'mrdamice_crm_local_calls';
const LOCAL_LOGS_KEY = 'mrdamice_crm_local_logs';

/**
 * Normalizes international phone formats (e.g., +1 (111) 111 1111 -> +11111111111)
 * while preserving display string for duplicates checking
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove spaces, parentheses, dashes, and non-digit characters except leading +
  const clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('+')) return clean;
  // If standard 10 digit US number, prepend +1
  const digitsOnly = clean.replace(/\D/g, '');
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }
  return `+${digitsOnly}`;
}

export async function submitCallOrLead(params: {
  phone: string;
  fullName?: string;
  email?: string;
  status: CallStatus;
  closedProgram?: OfferProgram;
  assistanceNote?: string;
  notes?: string;
  agentId: string;
  existingLeadId?: string;
}): Promise<AddCallResult> {
  const formattedDisplayPhone = params.phone.trim();
  const normalizedPhone = normalizePhoneNumber(params.phone);

  let isDuplicate = false;
  let targetLeadName = params.fullName || 'Lead San Non';
  let leadId = params.existingLeadId || `lead-${Date.now()}`;

  // 1. Local Storage Fallback Persistence (Supports all international formats: +1 (111) 111 1111)
  try {
    const storedLeads = localStorage.getItem(LOCAL_LEADS_KEY);
    const leadsList = storedLeads ? JSON.parse(storedLeads) : [];

    const existingLead = leadsList.find((l: any) => {
      const matchNormalized = normalizePhoneNumber(l.phone) === normalizedPhone;
      const matchRaw = l.phone === formattedDisplayPhone;
      const matchId = params.existingLeadId && l.id === params.existingLeadId;
      return matchNormalized || matchRaw || matchId;
    });

    if (existingLead) {
      isDuplicate = true;
      leadId = existingLead.id;
      targetLeadName = existingLead.full_name;
      existingLead.current_status = params.status;
      existingLead.last_call_at = new Date().toISOString();
      existingLead.updated_at = new Date().toISOString();
      localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(leadsList));
    } else {
      const newLeadObj = {
        id: leadId,
        full_name: targetLeadName,
        phone: formattedDisplayPhone, // Keep original formatted string for display
        email: params.email || null,
        assigned_to: params.agentId,
        created_by: params.agentId,
        current_status: params.status,
        last_call_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      leadsList.unshift(newLeadObj);
      localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(leadsList));
    }

    // Save Call Record in local storage
    const storedCalls = localStorage.getItem(LOCAL_CALLS_KEY);
    const callsList = storedCalls ? JSON.parse(storedCalls) : [];
    const newCallObj = {
      id: `call-${Date.now()}`,
      lead_id: leadId,
      agent_id: params.agentId,
      status: params.status,
      closed_program: params.status === 'Close' ? params.closedProgram : null,
      assistance_note: params.status === 'Assistance' ? params.assistanceNote : null,
      notes: params.notes || null,
      created_at: new Date().toISOString(),
    };
    callsList.unshift(newCallObj);
    localStorage.setItem(LOCAL_CALLS_KEY, JSON.stringify(callsList));

    // Save History Log in local storage
    const storedLogs = localStorage.getItem(LOCAL_LOGS_KEY);
    const logsList = storedLogs ? JSON.parse(storedLogs) : [];
    const newLogObj = {
      id: `log-${Date.now()}`,
      lead_id: leadId,
      agent_id: params.agentId,
      action_type: isDuplicate ? 'CALL_UPDATED_STATUS' : 'LEAD_CREATED_AND_CALLED',
      status: params.status,
      closed_program: params.status === 'Close' ? params.closedProgram : null,
      comment: params.notes || (params.status === 'Assistance' ? params.assistanceNote : `Apèl sovgarde ak estati: ${params.status}`),
      created_at: new Date().toISOString(),
    };
    logsList.unshift(newLogObj);
    localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(logsList));

  } catch (err) {
    console.warn('LocalStorage save notice for call:', err);
  }

  // 2. Try updating Supabase gracefully in background
  try {
    if (isDuplicate) {
      await supabase
        .from('leads')
        .update({
          current_status: params.status,
          last_call_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId);
    } else {
      await supabase.from('leads').upsert({
        id: leadId,
        full_name: targetLeadName,
        phone: formattedDisplayPhone,
        email: params.email || null,
        assigned_to: params.agentId,
        created_by: params.agentId,
        current_status: params.status,
        last_call_at: new Date().toISOString(),
      });
    }

    await supabase.from('calls').insert({
      lead_id: leadId,
      agent_id: params.agentId,
      status: params.status,
      closed_program: params.status === 'Close' ? params.closedProgram : null,
      assistance_note: params.status === 'Assistance' ? params.assistanceNote : null,
      notes: params.notes,
    });

    await supabase.from('history_logs').insert({
      lead_id: leadId,
      agent_id: params.agentId,
      action_type: isDuplicate ? 'CALL_UPDATED_STATUS' : 'LEAD_CREATED_AND_CALLED',
      status: params.status,
      closed_program: params.status === 'Close' ? params.closedProgram : null,
      comment: params.notes || `Estati apèl sovgarde: ${params.status}`,
    });
  } catch (supabaseError) {
    console.warn('Supabase call update notice:', supabaseError);
  }

  return {
    success: true,
    isDuplicate,
    leadId,
    message: isDuplicate
      ? `Estati apèl la mete ajou avèk siksè pou lead: ${targetLeadName}!`
      : `Apèl la ak nouvo lead la sovgarde avèk siksè!`,
  };
}

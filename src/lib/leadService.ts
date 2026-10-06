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
  const cleanPhone = params.phone.trim();
  let isDuplicate = false;
  let targetLeadName = params.fullName || 'Lead San Non';
  let leadId = params.existingLeadId || `lead-${Date.now()}`;

  // 1. Local Storage Fallback Persistence (Prevents Network & Invalid Path Errors)
  try {
    const storedLeads = localStorage.getItem(LOCAL_LEADS_KEY);
    const leadsList = storedLeads ? JSON.parse(storedLeads) : [];

    const existingLead = leadsList.find((l: any) => l.phone === cleanPhone || (params.existingLeadId && l.id === params.existingLeadId));

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
        phone: cleanPhone,
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
        phone: cleanPhone,
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
      ? `Estati apèl la mete ajou avèk siksè sou lead: ${targetLeadName}!`
      : `Apèl la ak nouvo lead la sovgarde avèk siksè!`,
  };
}

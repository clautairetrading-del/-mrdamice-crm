import { supabase } from './supabaseClient';
import { Lead, CallStatus, OfferProgram, HistoryLog, Call } from '@/types/crm';

export interface AddCallResult {
  success: boolean;
  isDuplicate: boolean;
  leadId: string;
  message: string;
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
  const cleanPhone = params.phone.trim();
  
  // 1. Check if lead exists by phone if lead ID was not explicitly passed
  let targetLead: { id: string; full_name: string; assigned_to?: string } | null = null;
  
  if (params.existingLeadId) {
    const { data } = await supabase
      .from('leads')
      .select('id, full_name, assigned_to')
      .eq('id', params.existingLeadId)
      .single();
    targetLead = data;
  } else {
    const { data } = await supabase
      .from('leads')
      .select('id, full_name, assigned_to')
      .eq('phone', cleanPhone)
      .maybeSingle();
    targetLead = data;
  }

  const isDuplicate = !!targetLead;

  let leadId = targetLead?.id || '';

  if (isDuplicate) {
    // DUPLICATE LOGIC: Update existing lead status & append history log
    await supabase
      .from('leads')
      .update({
        current_status: params.status,
        last_call_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    // Insert Call record
    await supabase.from('calls').insert({
      lead_id: leadId,
      agent_id: params.agentId,
      status: params.status,
      closed_program: params.status === 'Close' ? params.closedProgram : null,
      assistance_note: params.status === 'Assistance' ? params.assistanceNote : null,
      notes: params.notes,
    });

    // Insert History Log indicating duplicate attempt / new interaction
    await supabase.from('history_logs').insert({
      lead_id: leadId,
      agent_id: params.agentId,
      action_type: 'DUPLICATE_ATTEMPT_CALL',
      status: params.status,
      closed_program: params.status === 'Close' ? params.closedProgram : null,
      comment: params.notes || `Ajan an teste/rele nimewo sa a ankò. Estati: ${params.status}`,
    });

    return {
      success: true,
      isDuplicate: true,
      leadId,
      message: `Nimewo sa a te deja egziste! Nou ajoute istorik ak ti nòt apèl la sou lead: ${targetLead?.full_name}.`,
    };
  } else {
    // NEW LEAD LOGIC: Create new lead and link to agent
    const { data: newLead, error: createError } = await supabase
      .from('leads')
      .insert({
        full_name: params.fullName || 'Lead San Non',
        phone: cleanPhone,
        email: params.email || null,
        assigned_to: params.agentId,
        created_by: params.agentId,
        current_status: params.status,
        last_call_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (createError || !newLead) {
      throw new Error(createError?.message || 'Erè nan kreyasyon nouvo lead la.');
    }

    leadId = newLead.id;

    // Insert Call record
    await supabase.from('calls').insert({
      lead_id: leadId,
      agent_id: params.agentId,
      status: params.status,
      closed_program: params.status === 'Close' ? params.closedProgram : null,
      assistance_note: params.status === 'Assistance' ? params.assistanceNote : null,
      notes: params.notes,
    });

    // Insert Initial History Log
    await supabase.from('history_logs').insert({
      lead_id: leadId,
      agent_id: params.agentId,
      action_type: 'LEAD_CREATED_AND_CALLED',
      status: params.status,
      closed_program: params.status === 'Close' ? params.closedProgram : null,
      comment: params.notes || `Nouvo lead kreye ak estati premye apèl: ${params.status}`,
    });

    return {
      success: true,
      isDuplicate: false,
      leadId,
      message: `Nouvo lead kreye avèk siksè epi asiyen ba ou!`,
    };
  }
}

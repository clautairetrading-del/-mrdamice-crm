import { supabase } from './supabaseClient';

export interface CSVLeadRow {
  full_name?: string;
  name?: string;
  phone?: string;
  telephon?: string;
  email?: string;
}

export interface CSVImportResult {
  addedCount: number;
  duplicateCount: number;
  errorCount: number;
  messages: string[];
}

export async function importLeadsFromCSV(
  rows: CSVLeadRow[],
  agentId: string
): Promise<CSVImportResult> {
  let addedCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;
  const messages: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawName = row.full_name || row.name || 'Lead San Non';
    const rawPhone = row.phone || row.telephon || '';
    const rawEmail = row.email || '';

    const cleanPhone = rawPhone.toString().trim();
    if (!cleanPhone) {
      errorCount++;
      continue;
    }

    // Check duplicate by phone
    const { data: existing } = await supabase
      .from('leads')
      .select('id, full_name')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existing) {
      duplicateCount++;
      // Add history log for duplicate import attempt
      await supabase.from('history_logs').insert({
        lead_id: existing.id,
        agent_id: agentId,
        action_type: 'CSV_IMPORT_DUPLICATE',
        comment: `Ajan an te kòmande yon tentativ enpòtasyon CSV pou nimewo sa a ki te deja nan sistèm nan.`,
      });
    } else {
      // Create new lead without mandatory call status (defaults to 'Poko rele' or pending)
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert({
          full_name: rawName.trim(),
          phone: cleanPhone,
          email: rawEmail ? rawEmail.trim() : null,
          assigned_to: agentId,
          created_by: agentId,
          current_status: 'Poko rele',
        })
        .select('id')
        .single();

      if (error || !newLead) {
        errorCount++;
      } else {
        addedCount++;
        // Add initial log
        await supabase.from('history_logs').insert({
          lead_id: newLead.id,
          agent_id: agentId,
          action_type: 'CSV_IMPORT_CREATED',
          comment: `Nouvo lead san estati apèl enpòte nan dosye ajan an.`,
        });
      }
    }
  }

  messages.push(`Rezime: ${addedCount} nouvo lead enpòte, ${duplicateCount} doublon detekte epi sovgarde nan istorik log.`);

  return {
    addedCount,
    duplicateCount,
    errorCount,
    messages,
  };
}

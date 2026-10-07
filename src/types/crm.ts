export type UserRole = 'admin' | 'worker';

export type CallStatus = 
  | 'Poko rele'
  | 'Pa jwenn li'
  | 'Gen follow up'
  | 'Pa enterese'
  | 'Mwen pale ak li'
  | 'Close'
  | 'Assistance';

export type OfferProgram = 
  | 'Fòmasyon $199 USD'
  | 'Done For You $1,000 USD';

export interface WorkerCommissionRate {
  rate199: number;  // percentage e.g. 15 for 15%
  rate1000: number; // percentage e.g. 20 for 20%
}

export interface CommissionConfig {
  price199: number;
  rate199: number; // default global percentage
  price1000: number;
  rate1000: number; // default global percentage
  workerRates?: Record<string, WorkerCommissionRate>; // key: worker email/id -> rates
}

export const DEFAULT_COMMISSION_CONFIG: CommissionConfig = {
  price199: 199,
  rate199: 15,
  price1000: 1000,
  rate1000: 20,
  workerRates: {},
};

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_online: boolean;
  last_seen_at?: string;
  created_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  phone: string;
  email?: string;
  assigned_to?: string;
  created_by?: string;
  current_status: CallStatus;
  followup_date?: string;
  followup_time?: string;
  last_call_at?: string;
  created_at: string;
  updated_at: string;
  // Optional expanded fields
  assigned_agent?: Profile;
}

export interface Call {
  id: string;
  lead_id: string;
  agent_id: string;
  status: CallStatus;
  closed_program?: OfferProgram;
  assistance_note?: string;
  followup_date?: string;
  followup_time?: string;
  notes?: string;
  created_at: string;
  // Optional relations
  lead?: Lead;
  agent?: Profile;
}

export interface HistoryLog {
  id: string;
  lead_id: string;
  agent_id: string;
  action_type: string;
  status?: CallStatus;
  closed_program?: OfferProgram;
  comment?: string;
  created_at: string;
  // Optional relation
  agent?: Profile;
}

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "prospectador"
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  owner_name: string
  company_name: string
  niche: string
  phone: string
  meeting_date: string
  status: "pendente" | "falha" | "sucedida" | "avaliando"
  proposed_value: number
  closed_value: number
  user_id: string
  created_at: string
  updated_at: string
  google_meet_link?: string
  admin_acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
  user?: User
  acknowledgedByUser?: User
}

export interface DashboardStats {
  totalClosed: number
  totalPending: number
  failedMeetings: number
  clientsInEvaluation: number
  pendingMeetings: number
}

export interface ScheduleSlot {
  date: string
  time: string
  available: boolean
  clientName?: string
}

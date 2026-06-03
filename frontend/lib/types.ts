export type Role = "user" | "agent";

export type TicketStatus = "open" | "in_progress" | "resolved";
export type TicketPriority = "low" | "medium" | "high";

export interface Comment {
  id: number;
  body: string;
  role: Role;
  created_at: string;
}

export interface Ticket {
  id: number;
  title: string;
  body: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  comments: Comment[];
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "未対応",
  in_progress: "対応中",
  resolved: "解決済み",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

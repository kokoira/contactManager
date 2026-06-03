import type { Ticket, Comment, TicketPriority, TicketStatus, Role } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.errors?.join(", ") ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  tickets: {
    list: (options?: { includeDeleted?: boolean }) =>
      request<Ticket[]>(options?.includeDeleted ? "/tickets?include_deleted=true" : "/tickets"),
    get: (id: number) => request<Ticket>(`/tickets/${id}`),
    create: (data: { title: string; body: string; priority: TicketPriority }) =>
      request<Ticket>("/tickets", {
        method: "POST",
        body: JSON.stringify({ ticket: data }),
      }),
    update: (id: number, data: { status?: TicketStatus; priority?: TicketPriority }) =>
      request<Ticket>(`/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ ticket: data }),
      }),
    destroy: (id: number) =>
      request<void>(`/tickets/${id}`, { method: "DELETE" }),
  },
  comments: {
    create: (ticketId: number, data: { body: string; role: Role }) =>
      request<Comment>(`/tickets/${ticketId}/comments`, {
        method: "POST",
        body: JSON.stringify({ comment: data }),
      }),
  },
};

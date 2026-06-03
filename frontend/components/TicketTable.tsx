"use client";

import Link from "next/link";
import type { Ticket, Role } from "@/lib/types";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/types";

interface Props {
  tickets: Ticket[];
  role: Role;
}

export default function TicketTable({ tickets, role }: Props) {
  if (tickets.length === 0) {
    return (
      <p className="text-center text-slate-500 py-12">チケットがありません</p>
    );
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-slate-200 text-left text-sm text-slate-500">
          <th className="py-3 pr-4 w-16">ID</th>
          <th className="py-3 pr-4">タイトル</th>
          <th className="py-3 pr-4 w-24">ステータス</th>
          <th className="py-3 pr-4 w-16">緊急度</th>
          <th className="py-3 w-40">作成日時</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => {
          const isDeleted = ticket.deleted_at !== null;
          if (isDeleted && role === "agent") {
            return <DeletedTicketRow key={ticket.id} ticket={ticket} />;
          }
          return <ActiveTicketRow key={ticket.id} ticket={ticket} />;
        })}
      </tbody>
    </table>
  );
}

function ActiveTicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-indigo-50 cursor-pointer transition-colors">
      <td className="py-3 pr-4 text-sm text-slate-400">
        <Link href={`/tickets/${ticket.id}`} className="block">
          #{ticket.id}
        </Link>
      </td>
      <td className="py-3 pr-4 text-sm font-medium text-slate-800">
        <Link href={`/tickets/${ticket.id}`} className="block hover:text-indigo-600">
          {ticket.title}
        </Link>
      </td>
      <td className="py-3 pr-4">
        <Link href={`/tickets/${ticket.id}`} className="block">
          <StatusBadge status={ticket.status} />
        </Link>
      </td>
      <td className="py-3 pr-4">
        <Link href={`/tickets/${ticket.id}`} className="block">
          <PriorityBadge priority={ticket.priority} />
        </Link>
      </td>
      <td className="py-3 text-sm text-slate-500">
        <Link href={`/tickets/${ticket.id}`} className="block">
          {formatDate(ticket.created_at)}
        </Link>
      </td>
    </tr>
  );
}

function DeletedTicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <tr className="border-b border-slate-100 bg-slate-50">
      <td className="py-3 pr-4 text-sm text-slate-300">
        <Link href={`/tickets/${ticket.id}`} className="block">
          #{ticket.id}
        </Link>
      </td>
      <td className="py-3 pr-4 text-sm font-medium text-slate-400">
        <Link href={`/tickets/${ticket.id}`} className="block line-through">
          {ticket.title}
        </Link>
      </td>
      <td className="py-3 pr-4">
        <Link href={`/tickets/${ticket.id}`} className="block">
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-400">
            削除済み
          </span>
        </Link>
      </td>
      <td className="py-3 pr-4">
        <Link href={`/tickets/${ticket.id}`} className="block">
          <PriorityBadge priority={ticket.priority} muted />
        </Link>
      </td>
      <td className="py-3 text-sm text-slate-400">
        <Link href={`/tickets/${ticket.id}`} className="block">
          {formatDate(ticket.created_at)}
        </Link>
      </td>
    </tr>
  );
}

function PriorityBadge({ priority, muted = false }: { priority: Ticket["priority"]; muted?: boolean }) {
  const styles = muted
    ? { low: "bg-slate-100 text-slate-400", medium: "bg-slate-100 text-slate-400", high: "bg-slate-100 text-slate-400" }
    : { low: "bg-emerald-100 text-emerald-700", medium: "bg-amber-100 text-amber-700", high: "bg-red-100 text-red-700" };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${styles[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const styles = {
    open: "bg-red-100 text-red-700",
    in_progress: "bg-amber-100 text-amber-700",
    resolved: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

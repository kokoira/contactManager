"use client";

import Link from "next/link";
import type { Ticket } from "@/lib/types";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/types";

interface Props {
  tickets: Ticket[];
}

export default function TicketTable({ tickets }: Props) {
  if (tickets.length === 0) {
    return (
      <p className="text-center text-gray-500 py-12">チケットがありません</p>
    );
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
          <th className="py-3 pr-4 w-16">ID</th>
          <th className="py-3 pr-4">タイトル</th>
          <th className="py-3 pr-4 w-24">ステータス</th>
          <th className="py-3 pr-4 w-16">優先度</th>
          <th className="py-3 w-28">作成日</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <tr
            key={ticket.id}
            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
          >
            <td className="py-3 pr-4 text-sm text-gray-500">
              <Link href={`/tickets/${ticket.id}`} className="block">
                #{ticket.id}
              </Link>
            </td>
            <td className="py-3 pr-4 text-sm font-medium text-gray-900">
              <Link href={`/tickets/${ticket.id}`} className="block hover:text-blue-600">
                {ticket.title}
              </Link>
            </td>
            <td className="py-3 pr-4">
              <Link href={`/tickets/${ticket.id}`} className="block">
                <StatusBadge status={ticket.status} />
              </Link>
            </td>
            <td className="py-3 pr-4 text-sm text-gray-700">
              <Link href={`/tickets/${ticket.id}`} className="block">
                {PRIORITY_LABELS[ticket.priority]}
              </Link>
            </td>
            <td className="py-3 text-sm text-gray-500">
              <Link href={`/tickets/${ticket.id}`} className="block">
                {formatDate(ticket.created_at)}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatusBadge({ status }: { status: Ticket["status"] }) {
  const styles = {
    open: "bg-red-100 text-red-700",
    in_progress: "bg-yellow-100 text-yellow-700",
    resolved: "bg-green-100 text-green-700",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

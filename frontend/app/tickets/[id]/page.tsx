"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";
import { api } from "@/lib/api";
import CommentSection from "@/components/CommentSection";
import type { Ticket, TicketStatus } from "@/lib/types";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/types";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tickets.get(Number(id)).then(setTicket).finally(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(status: TicketStatus) {
    if (!ticket) return;
    const updated = await api.tickets.updateStatus(ticket.id, status);
    setTicket((prev) => (prev ? { ...prev, ...updated } : prev));
  }

  if (loading) return <p className="text-center text-gray-400 py-12">読み込み中...</p>;
  if (!ticket) return <p className="text-center text-gray-500 py-12">チケットが見つかりません</p>;

  return (
    <div className="max-w-2xl">
      <Link href="/" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        ← 一覧に戻る
      </Link>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{ticket.title}</h2>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm mb-4">
          <div>
            <dt className="text-gray-500">優先度</dt>
            <dd className="font-medium text-gray-800">{PRIORITY_LABELS[ticket.priority]}</dd>
          </div>
          <div>
            <dt className="text-gray-500">ステータス</dt>
            <dd>
              {role === "agent" ? (
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="open">未対応</option>
                  <option value="in_progress">対応中</option>
                  <option value="resolved">解決済み</option>
                </select>
              ) : (
                <span className="font-medium text-gray-800">{STATUS_LABELS[ticket.status]}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500">作成日時</dt>
            <dd className="text-gray-700">{formatDateTime(ticket.created_at)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">更新日時</dt>
            <dd className="text-gray-700">{formatDateTime(ticket.updated_at)}</dd>
          </div>
        </dl>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{ticket.body}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">コメント</h3>
        <CommentSection ticketId={ticket.id} initialComments={ticket.comments} />
      </div>
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

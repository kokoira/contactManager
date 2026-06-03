"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRole } from "@/contexts/RoleContext";
import { api } from "@/lib/api";
import CommentSection from "@/components/CommentSection";
import type { Ticket, TicketStatus, TicketPriority } from "@/lib/types";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/types";

const STATUS_SELECT_STYLES: Record<TicketStatus, string> = {
  open: "border-red-300 bg-red-50 text-red-700 focus:ring-red-300",
  in_progress: "border-amber-300 bg-amber-50 text-amber-700 focus:ring-amber-300",
  resolved: "border-emerald-300 bg-emerald-50 text-emerald-700 focus:ring-emerald-300",
};

const PRIORITY_SELECT_STYLES: Record<TicketPriority, string> = {
  low: "border-emerald-300 bg-emerald-50 text-emerald-700 focus:ring-emerald-300",
  medium: "border-amber-300 bg-amber-50 text-amber-700 focus:ring-amber-300",
  high: "border-red-300 bg-red-50 text-red-700 focus:ring-red-300",
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { role } = useRole();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [draftStatus, setDraftStatus] = useState<TicketStatus | null>(null);
  const [draftPriority, setDraftPriority] = useState<TicketPriority | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.tickets.get(Number(id)).then((t) => {
      setTicket(t);
      setDraftStatus(null);
      setDraftPriority(null);
    }).finally(() => setLoading(false));
  }, [id]);

  const isDirty =
    (draftStatus !== null && ticket !== null && draftStatus !== ticket.status) ||
    (draftPriority !== null && ticket !== null && draftPriority !== ticket.priority);

  const displayStatus: TicketStatus = draftStatus ?? ticket?.status ?? "open";
  const displayPriority: TicketPriority = draftPriority ?? ticket?.priority ?? "medium";

  const isDeleted = ticket?.deleted_at !== null && ticket?.deleted_at !== undefined;

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  async function handleSave() {
    if (!ticket) return;
    const data: { status?: TicketStatus; priority?: TicketPriority } = {};
    if (draftStatus !== null && draftStatus !== ticket.status) data.status = draftStatus;
    if (draftPriority !== null && draftPriority !== ticket.priority) data.priority = draftPriority;
    if (Object.keys(data).length === 0) return;
    setSaving(true);
    try {
      const updated = await api.tickets.update(ticket.id, data);
      setTicket((prev) => (prev ? { ...prev, ...updated } : prev));
      setDraftStatus(null);
      setDraftPriority(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!ticket) return;
    const ok = window.confirm(
      `「${ticket.title}」を削除しますか？\nこの操作は取り消せません。`
    );
    if (!ok) return;
    setDeleting(true);
    try {
      await api.tickets.destroy(ticket.id);
      router.push("/");
    } finally {
      setDeleting(false);
    }
  }

  const handleBack = useCallback(() => {
    if (isDirty) {
      const ok = window.confirm(
        "変更が保存されていません。\nページを離れますか？"
      );
      if (!ok) return;
    }
    router.push("/");
  }, [isDirty, router]);

  if (loading) return <p className="text-center text-slate-400 py-12">読み込み中...</p>;
  if (!ticket) return <p className="text-center text-slate-500 py-12">チケットが見つかりません</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleBack}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← 一覧に戻る
        </button>
        {role === "user" && !isDeleted && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {deleting ? "削除中..." : "削除する"}
          </button>
        )}
      </div>

      {isDeleted && (
        <div className="mb-4 p-3 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 font-medium">
          このチケットは削除済みです
        </div>
      )}

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6 mb-4">
        <h2 className="text-xl font-semibold text-slate-900 mb-5">{ticket.title}</h2>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mb-5">
          <div>
            <dt className="text-slate-400 text-xs uppercase tracking-wide mb-1">緊急度</dt>
            <dd>
              {isDeleted ? (
                <PriorityBadge priority={ticket.priority} />
              ) : (
                <select
                  value={displayPriority}
                  onChange={(e) => setDraftPriority(e.target.value as TicketPriority)}
                  className={`w-fit border rounded-lg px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 transition-colors ${PRIORITY_SELECT_STYLES[displayPriority]}`}
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400 text-xs uppercase tracking-wide mb-1">ステータス</dt>
            <dd>
              {role === "agent" && !isDeleted ? (
                <select
                  value={displayStatus}
                  onChange={(e) => setDraftStatus(e.target.value as TicketStatus)}
                  className={`w-fit border rounded-lg px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 transition-colors ${STATUS_SELECT_STYLES[displayStatus]}`}
                >
                  <option value="open">未対応</option>
                  <option value="in_progress">対応中</option>
                  <option value="resolved">解決済み</option>
                </select>
              ) : (
                <StatusBadge status={ticket.status} />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400 text-xs uppercase tracking-wide mb-1">作成日時</dt>
            <dd className="text-slate-700">{formatDateTime(ticket.created_at)}</dd>
          </div>
          <div>
            <dt className="text-slate-400 text-xs uppercase tracking-wide mb-1">更新日時</dt>
            <dd className="text-slate-700">{formatDateTime(ticket.updated_at)}</dd>
          </div>
        </dl>

        {isDirty && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-xs text-amber-700 font-medium flex-1">未保存の変更があります</span>
            <button
              onClick={() => { setDraftStatus(null); setDraftPriority(null); }}
              className="px-3 py-1 border border-slate-300 text-slate-600 text-xs rounded-lg hover:bg-slate-50 transition-colors"
            >
              元に戻す
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1 bg-teal-600 text-white text-xs rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "保存中..." : "保存する"}
            </button>
          </div>
        )}

        <div className="border-t border-slate-100 pt-4">
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{ticket.body}</p>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-600 mb-4">メッセージ</h3>
        <CommentSection ticketId={ticket.id} initialComments={ticket.comments} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const styles: Record<TicketStatus, string> = {
    open: "bg-red-100 text-red-700",
    in_progress: "bg-amber-100 text-amber-700",
    resolved: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`inline-block self-start px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const styles: Record<TicketPriority, string> = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block self-start px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

function formatDateTime(iso: string): string {
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

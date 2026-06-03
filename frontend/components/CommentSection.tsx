"use client";

import { useState } from "react";
import { useRole } from "@/contexts/RoleContext";
import { api } from "@/lib/api";
import type { Comment } from "@/lib/types";

interface Props {
  ticketId: number;
  initialComments: Comment[];
}

export default function CommentSection({ ticketId, initialComments }: Props) {
  const { role } = useRole();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const comment = await api.comments.create(ticketId, { body: body.trim(), role });
      setComments((prev) => [...prev, comment]);
      setBody("");
    } catch {
      setSubmitError("送信に失敗しました。再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="space-y-4 mb-6 max-h-[480px] overflow-y-auto pr-1">
        {comments.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-6">
            まだメッセージがありません
          </p>
        )}
        {comments.map((c) => {
          const isMine = c.role === role;
          return (
            <div
              key={c.id}
              className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
            >
              <Avatar role={c.role} />
              <div className={`max-w-[72%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                    isMine
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-800 rounded-bl-sm"
                  }`}
                >
                  {c.body}
                </div>
                <span className="text-[11px] text-slate-400 px-1">
                  {formatDateTime(c.created_at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {submitError && (
        <p className="text-xs text-red-600 mb-2">{submitError}</p>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as React.FormEvent);
          }}
          placeholder="メッセージを入力"
          rows={2}
          className="flex-1 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
        />
        <button
          type="submit"
          disabled={submitting || !body.trim()}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed self-end h-[38px]"
        >
          {submitting ? "送信中..." : "送信"}
        </button>
      </form>
    </div>
  );
}

function Avatar({ role }: { role: "user" | "agent" }) {
  const isAgent = role === "agent";
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
        isAgent ? "bg-teal-100 text-teal-700" : "bg-indigo-100 text-indigo-700"
      }`}
    >
      {isAgent ? "担" : "ユ"}
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

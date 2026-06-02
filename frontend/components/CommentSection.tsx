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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      const comment = await api.comments.create(ticketId, { body: body.trim(), role });
      setComments((prev) => [...prev, comment]);
      setBody("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <hr className="border-gray-200 my-6" />
      <div className="space-y-3 mb-6">
        {comments.map((c) => (
          <div key={c.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex gap-2 items-center mb-2">
              <span className="text-xs font-medium text-gray-600">
                {c.role === "user" ? "ユーザー" : "担当者"}
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-400">{formatDateTime(c.created_at)}</span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{c.body}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-sm text-gray-400">コメントはまだありません</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="コメントを入力"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "投稿中..." : "投稿する"}
          </button>
        </div>
      </form>
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

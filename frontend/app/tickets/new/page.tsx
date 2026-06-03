"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { TicketPriority } from "@/lib/types";

const PRIORITY_SELECT_STYLES: Record<TicketPriority, string> = {
  low: "border-emerald-300 bg-emerald-50 text-emerald-700 focus:ring-emerald-300",
  medium: "border-amber-300 bg-amber-50 text-amber-700 focus:ring-amber-300",
  high: "border-red-300 bg-red-50 text-red-700 focus:ring-red-300",
};

export default function NewTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.tickets.create({ title, body, priority });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">新規お問い合わせ</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              本文 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={5}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">緊急度</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className={`w-fit border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 transition-colors ${PRIORITY_SELECT_STYLES[priority]}`}
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Link
              href="/"
              className="px-4 py-2 border border-slate-300 text-sm rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? "作成中..." : "作成する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

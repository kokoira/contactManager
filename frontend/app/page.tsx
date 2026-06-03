"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRole } from "@/contexts/RoleContext";
import { api } from "@/lib/api";
import TicketTable from "@/components/TicketTable";
import type { Ticket } from "@/lib/types";

export default function TicketListPage() {
  const { role } = useRole();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tickets.list().then(setTickets).finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          {role === "user" ? "自分のお問い合わせ" : "すべてのお問い合わせ"}
        </h2>
        {role === "user" && (
          <Link
            href="/tickets/new"
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            + 新規お問い合わせ
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-center text-slate-400 py-12">読み込み中...</p>
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </div>
  );
}

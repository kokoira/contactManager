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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          {role === "user" ? "自分のお問い合わせ" : "すべてのお問い合わせ"}
        </h2>
        {role === "user" && (
          <Link
            href="/tickets/new"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            + 新規お問い合わせ
          </Link>
        )}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-12">読み込み中...</p>
      ) : (
        <TicketTable tickets={tickets} />
      )}
    </div>
  );
}

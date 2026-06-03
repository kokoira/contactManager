"use client";

import { useRole } from "@/contexts/RoleContext";

export default function Header() {
  const { role, setRole } = useRole();
  const isAgent = role === "agent";

  return (
    <header
      className={`px-6 py-4 flex items-center justify-between transition-colors duration-300 ${
        isAgent ? "bg-teal-700" : "bg-indigo-600"
      }`}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-white">お問い合わせ管理</h1>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            isAgent
              ? "bg-teal-500 text-teal-100"
              : "bg-indigo-500 text-indigo-100"
          }`}
        >
          {isAgent ? "担当者モード" : "ユーザーモード"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className={`text-sm ${!isAgent ? "font-bold text-white" : "text-white/50"}`}>
          ユーザー
        </span>
        <button
          onClick={() => setRole(isAgent ? "user" : "agent")}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${
            isAgent ? "bg-teal-500" : "bg-indigo-400"
          }`}
          aria-label="ロール切り替え"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              isAgent ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm ${isAgent ? "font-bold text-white" : "text-white/50"}`}>
          担当者
        </span>
      </div>
    </header>
  );
}

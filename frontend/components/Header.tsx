"use client";

import { useRole } from "@/contexts/RoleContext";

export default function Header() {
  const { role, setRole } = useRole();
  const isAgent = role === "agent";

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800">お問い合わせ管理</h1>
      <div className="flex items-center gap-3">
        <span className={`text-sm ${!isAgent ? "font-bold text-gray-900" : "text-gray-400"}`}>
          ユーザー
        </span>
        <button
          onClick={() => setRole(isAgent ? "user" : "agent")}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            isAgent ? "bg-blue-600" : "bg-gray-300"
          }`}
          aria-label="ロール切り替え"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
              isAgent ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm ${isAgent ? "font-bold text-gray-900" : "text-gray-400"}`}>
          担当者
        </span>
      </div>
    </header>
  );
}

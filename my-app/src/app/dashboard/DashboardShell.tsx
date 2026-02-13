"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useDashboardStore } from "@/src/services/api/dashboard/dashboard-api-store";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

const { chatHistory, currentChatId, loadChat, startNewChat } = useDashboardStore();
const uniqueChats = Array.from(
  new Map(
    chatHistory.map((msg) => [
      msg.chat_id,
      {
        chat_id: msg.chat_id,
        title: msg.query,
      },
    ])
  ).values()
);

console.log("ChatHistory from sidebar:", chatHistory);



  return (
  <div className="flex flex-1">

    {/* SIDEBAR */}
    <div
      className={`bg-white border-r transition-all duration-300 flex flex-col ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* HEADER */}
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <span className="font-semibold text-slate-800">
            Chats
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-slate-100 transition"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* NEW CHAT BUTTON */}
      <div className="px-3 pb-3">
        <button
          onClick={startNewChat}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="text-sm font-medium">
            {collapsed ? "+" : "+ New Chat"}
          </span>
        </button>
      </div>

      <div className="border-t" />

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chatHistory.length === 0 ? (
          !collapsed && (
            <p className="text-sm text-slate-400 text-center mt-4">
              No chats yet
            </p>
          )
        ) : (
          uniqueChats.map((chat) => (
            <button
              key={chat.chat_id}
              onClick={() => loadChat(chat.chat_id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm truncate transition ${
                chat.chat_id === currentChatId
                  ? "bg-slate-200 font-medium"
                  : "hover:bg-slate-100"
              }`}
            >
              {collapsed ? "•" : chat.title}
            </button>
          ))
        )}
      </div>
    </div>

    {/* MAIN CONTENT */}
    <main className="flex-1 overflow-y-auto bg-white">
      {children}
    </main>

  </div>
);
}
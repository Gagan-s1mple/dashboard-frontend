/* eslint-disable react-hooks/purity */

"use client";

import { useState } from "react";
import { Menu, Plus, MessageSquare, Trash2 } from "lucide-react";
import { useChatStore } from "@/src/services/api/chat/chat-store";
;

export const ChatSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  
  const {
    chatTitles,
    currentChatId,
    isLoadingTitles,
    fetchChatHistory,
    createNewChat,
    deleteChat,
  } = useChatStore();

  // ✅ FIX: Always ensure chatTitles is an array
  const safeChatTitles = Array.isArray(chatTitles) ? chatTitles : [];

  const handleSelectChat = (chatId: string) => {
    if (chatId) {
      fetchChatHistory(chatId);
    }
  };

  const handleNewChat = () => {
    createNewChat();
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (chatId && confirm("Delete this chat?")) {
      deleteChat(chatId);
    }
  };

  return (
    <div
      className={`bg-white border-r transition-all duration-300 flex flex-col h-full ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      {/* HEADER */}
      <div className="p-4 flex items-center justify-between border-b">
        {!collapsed && (
          <span className="font-semibold text-lg text-slate-800">
            Chat History
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-slate-100 transition ml-auto"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {/* NEW CHAT BUTTON */}
      <div className="p-3">
        <button
          onClick={handleNewChat}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Plus className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">New Chat</span>}
        </button>
      </div>

      <div className="border-t" />

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoadingTitles ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        ) : safeChatTitles.length === 0 ? (
          !collapsed && (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No chats yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Start a new conversation
              </p>
            </div>
          )
        ) : (
          safeChatTitles
            .sort((a, b) => {
              const numA = parseInt(a?.chat_id || "0", 10);
              const numB = parseInt(b?.chat_id || "0", 10);
              return numB - numA;
            })
            .map((chat) => (
              <div
                key={chat?.chat_id || Math.random()}
                className={`group relative rounded-lg transition-all ${
                  chat?.chat_id === currentChatId
                    ? "bg-indigo-50 border border-indigo-200"
                    : "hover:bg-slate-50 border border-transparent"
                }`}
              >
                <button
                  onClick={() => handleSelectChat(chat?.chat_id)}
                  className={`w-full text-left px-3 py-2.5 text-sm truncate ${
                    collapsed ? "text-center" : ""
                  }`}
                  title={!collapsed ? chat?.title : undefined}
                >
                  {collapsed ? (
                    <MessageSquare className={`w-5 h-5 mx-auto ${
                      chat?.chat_id === currentChatId ? "text-indigo-600" : "text-slate-500"
                    }`} />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${
                        chat?.chat_id === currentChatId ? "text-indigo-600" : "text-slate-500"
                      }`} />
                      <span className={`truncate ${
                        chat?.chat_id === currentChatId ? "font-medium text-indigo-700" : "text-slate-700"
                      }`}>
                        {chat?.title || "Untitled Chat"}
                      </span>
                    </div>
                  )}
                </button>
                
                {!collapsed && (
                  <button
                    onClick={(e) => handleDeleteChat(e, chat?.chat_id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
                    title="Delete chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
        )}
      </div>

      {/* FOOTER */}
      {!collapsed && (
        <div className="p-4 border-t text-xs text-slate-400">
          {safeChatTitles.length} {safeChatTitles.length === 1 ? "chat" : "chats"}
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;
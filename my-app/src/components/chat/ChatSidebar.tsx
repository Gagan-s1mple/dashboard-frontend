/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { Menu, Plus, MessageSquare, Trash2, Edit2, X, Check, Search } from "lucide-react";
import { useChatStore } from "@/src/services/api/chat/chat-store";
import { useDashboardStore } from "@/src/services/api/dashboard/dashboard-api-store"; // ADD THIS
import { toast } from "sonner";
import { useSidebarStore } from "@/src/services/api/chat/sidebar-store";

export const ChatSidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{ id: string; title: string } | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    chatTitles,
    currentChatId,
    isLoadingTitles,
    fetchChatHistory,
    createNewChat,
    deleteChat,
    fetchChatTitles,
    updateChatTitle,
  } = useChatStore();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetchChatTitles();
    }
  }, [fetchChatTitles]);

  // Auto-click "New Chat" on load when requested (e.g. after refresh-continue)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const flagKey = "adro_auto_new_chat";
    const shouldStartNewChat = sessionStorage.getItem(flagKey);

    if (shouldStartNewChat === "true") {
      sessionStorage.removeItem(flagKey);

      setTimeout(() => {
        const newChatButton = document.getElementById("new-chat-button");
        if (newChatButton) {
          newChatButton.click();
        } else {
          handleNewChat();
        }
      }, 50);
    }
  }, []);

  const safeChatTitles = Array.isArray(chatTitles) ? chatTitles : [];

  const handleSelectChat = (chatId: string) => {
    if (chatId) {
      // NEW - Clear refresh loader flags when switching chats
      useDashboardStore.getState().setRefreshLoaderMessageId(null, null);
      fetchChatHistory(chatId);
    }
  };

  const handleNewChat = () => {
    createNewChat();
    toast.success("New chat started", { duration: 2000 });
  };

  const handleDeleteClick = (e: React.MouseEvent, chatId: string, chatTitle: string) => {
    e.stopPropagation();
    setChatToDelete({ id: chatId, title: chatTitle });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!chatToDelete) return;

    setIsDeleting(true);
    try {
      await deleteChat(chatToDelete.id);
      setShowDeleteModal(false);
      setChatToDelete(null);
      toast.success("Chat deleted successfully", { duration: 2000 });
    } catch (error) {
      setShowDeleteModal(false);
      setChatToDelete(null);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete chat",
        { duration: 3000 }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setShowDeleteModal(false);
    setChatToDelete(null);
  };

  const handleRenameClick = (e: React.MouseEvent, chatId: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  const handleRenameSave = async (chatId: string) => {
    if (!editingTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    if (editingTitle.trim() === getChatTitle(chatId)) {
      setEditingChatId(null);
      setEditingTitle("");
      return;
    }

    const titleToSave = editingTitle.trim();
    setEditingChatId(null);
    setEditingTitle("");

    try {
      const result = await updateChatTitle(chatId, titleToSave);

      if (result.success) {
        toast.success(result.message || "Chat renamed successfully", { duration: 2000 });
      } else {
        toast.error(result.message || "Failed to update title", { duration: 3000 });
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update title",
        { duration: 3000 }
      );
    }
  };

  const handleRenameCancel = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === "Enter") {
      handleRenameSave(chatId);
    } else if (e.key === "Escape") {
      handleRenameCancel();
    }
  };

  const getChatTitle = (chatId: string) => {
    const chat = safeChatTitles.find((c) => c?.chat_id === chatId);
    return chat?.title || "Untitled Chat";
  };

  const filteredTitles = safeChatTitles
    .slice()
    .sort((a, b) => {
      const numA = parseInt(a?.chat_id || "0", 10);
      const numB = parseInt(b?.chat_id || "0", 10);
      return numB - numA;
    })
    .filter(chat => 
      chat?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <>
      <div
        className={`border-r transition-all duration-300 flex flex-col h-full bg-white ${
          isCollapsed ? "w-16" : "w-72"
        }`}
      >
        <div className="p-4 flex items-center gap-3 border-b">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-slate-100 transition"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          {!isCollapsed && (
            <span className="font-semibold text-lg text-slate-800">
              Chat History
            </span>
          )}
        </div>

        <div className="p-3">
          <button
            id="new-chat-button"
            onClick={handleNewChat}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm justify-center`}
            title="New Chat"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">New Chat</span>
            )}
          </button>
        </div>

        {!isCollapsed && (
          <>
            <div className="px-3 py-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 pl-9 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="border-t" />
          </>
        )}

        {!isCollapsed && (
          <>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoadingTitles ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                </div>
              ) : filteredTitles.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">
                    {searchQuery ? "No matching chats" : "No chats yet"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {searchQuery ? "Try a different search" : "Start a new conversation"}
                  </p>
                </div>
              ) : (
                filteredTitles.map((chat) => (
                  <div
                    key={chat?.chat_id || Math.random()}
                    className={`group relative rounded-lg transition-all ${
                      chat?.chat_id === currentChatId
                        ? "bg-indigo-50 border border-indigo-200"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    {editingChatId === chat?.chat_id ? (
                      <div className="flex items-center gap-1 px-2 py-1.5">
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, chat?.chat_id)}
                          className="flex-1 text-sm px-2 py-1 border border-indigo-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameSave(chat?.chat_id);
                          }}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameCancel();
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSelectChat(chat?.chat_id)}
                          className="w-full text-left px-3 py-2.5 text-sm"
                          title={chat?.title}
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare
                              className={`w-4 h-4 flex-shrink-0 ${
                                chat?.chat_id === currentChatId
                                  ? "text-indigo-600"
                                  : "text-slate-500"
                              }`}
                            />
                            <span
                              className={`truncate w-40 ${
                                chat?.chat_id === currentChatId
                                  ? "font-medium text-indigo-700"
                                  : "text-slate-700"
                              }`}
                            >
                              {chat?.title || "Untitled Chat"}
                            </span>
                          </div>
                        </button>

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) =>
                              handleRenameClick(
                                e,
                                chat?.chat_id,
                                chat?.title || "Untitled Chat",
                              )
                            }
                            className="p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            title="Rename chat"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) =>
                              handleDeleteClick(
                                e,
                                chat?.chat_id,
                                chat?.title || "Untitled Chat",
                              )
                            }
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title="Delete chat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t text-xs text-slate-400">
              {filteredTitles.length} {filteredTitles.length === 1 ? "chat" : "chats"}
            </div>
          </>
        )}
      </div>

      {showDeleteModal && chatToDelete && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleCancelDelete}
          />
          <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                Delete Chat
              </h3>
            </div>

            <p className="text-slate-600 mb-2">
              Are you sure you want to delete this chat?
            </p>
            <p className="text-sm text-slate-500 mb-6 p-3 bg-slate-50 rounded-lg">
              &ldquo;{chatToDelete.title}&rdquo;
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-70 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ChatSidebar;
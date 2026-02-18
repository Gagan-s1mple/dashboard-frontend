
"use client";

import { useState, useEffect } from "react";
import { Menu, Plus, MessageSquare, Trash2, Edit2, X, Check } from "lucide-react";
import { useChatStore } from "@/src/services/api/chat/chat-store";
import { toast } from "sonner";

export const ChatSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{ id: string; title: string } | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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

  const safeChatTitles = Array.isArray(chatTitles) ? chatTitles : [];

  const handleSelectChat = (chatId: string) => {
    if (chatId) {
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
      // ✅ deleteChat now calls API first, updates UI only on success
      await deleteChat(chatToDelete.id);
      setShowDeleteModal(false);
      setChatToDelete(null);
      // ✅ Green toast on success
      toast.success("Chat deleted successfully", { duration: 2000 });
    } catch (error) {
      setShowDeleteModal(false);
      setChatToDelete(null);
      // ✅ Red toast on failure
      toast.error(
        error instanceof Error ? error.message : "Failed to delete chat",
        { duration: 3000 }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) return; // prevent closing while deleting
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

    // Clear editing state immediately for UX
    const titleToSave = editingTitle.trim();
    setEditingChatId(null);
    setEditingTitle("");

    try {
      // ✅ updateChatTitle calls API first, updates UI only on success
      const result = await updateChatTitle(chatId, titleToSave);

      if (result.success) {
        // ✅ Green toast on success
        toast.success(result.message || "Chat renamed successfully", { duration: 2000 });
      } else {
        // ✅ Red toast on failure
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

  return (
    <>
      <div
        className={`border-r transition-all duration-300 flex flex-col h-full bg-white ${
          collapsed ? "w-16" : "w-72"
        }`}
      >
        {/* ===== HEADER ===== */}
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

        {/* ===== NEW CHAT BUTTON ===== */}
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm justify-center`}
            title="New Chat"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            {/* ✅ Hide label text when collapsed */}
            {!collapsed && (
              <span className="text-sm font-medium">New Chat</span>
            )}
          </button>
        </div>

        {/* ✅ Everything below is hidden when collapsed */}
        {!collapsed && (
          <>
            <div className="border-t" />

            {/* CHAT LIST */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoadingTitles ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
                </div>
              ) : safeChatTitles.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No chats yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Start a new conversation
                  </p>
                </div>
              ) : (
                safeChatTitles
                  .slice()
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
                      {editingChatId === chat?.chat_id ? (
                        // RENAME MODE
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
                        // NORMAL MODE
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
                                className={`truncate ${
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

            {/* FOOTER */}
            <div className="p-4 border-t text-xs text-slate-400">
              {safeChatTitles.length}{" "}
              {safeChatTitles.length === 1 ? "chat" : "chats"}
            </div>
          </>
        )}
      </div>

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
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
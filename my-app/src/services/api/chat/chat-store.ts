/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { url } from "../api-url";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useUpdateTitleStore } from "./update-title";
import { useDeleteChatStore } from "./delete-chat";

// ============ TYPES ============

export interface ChatTitle {
  chat_id: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  query: string;
  files: string[];
  response?: any; // Dashboard data
  timestamp: Date;
  role: "user" | "assistant";
  content: string;
}

export interface FullChat {
  chat_id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ============ API CLASS ============

class ChatHistoryAPI {
  private baseUrl: string;

  constructor(baseUrl: string = `${url.backendUrl}`) {
    this.baseUrl = baseUrl;
  }

  // GET /api/titles - Fetch all chat titles for user
  async fetchChatTitles(): Promise<ChatTitle[]> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return [];

      const response = await fetch(`${this.baseUrl}/api/titles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) return [];

      const data = await response.json();

      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && data.titles && Array.isArray(data.titles)) {
        return data.titles;
      } else if (data && data.chats && Array.isArray(data.chats)) {
        return data.chats;
      }

      return [];
    } catch (error) {

      return [];
    }
  }

  // GET /api/history?chat_id=XXX - Fetch full chat history
  async fetchChatHistory(chatId: string): Promise<any[]> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        console.warn(" No auth token found");
        return [];
      }

      

      const response = await fetch(
        `${this.baseUrl}/api/history?chat_id=${chatId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      // ("📥 Response status:", response.status);

      if (!response.ok) {
      
        return [];
      }

      const data = await response.json();
      // ("Chat history received:", data);

      // Extract messages from the nested structure
      if (data && data.chats && data.chats.messages) {
        return data.chats.messages;
      } else if (Array.isArray(data)) {
        return data;
      } else if (data && data.messages && Array.isArray(data.messages)) {
        return data.messages;
      } else {
       
        return [];
      }
    } catch (error) {

      return [];
    }
  }
}

export const chatHistoryAPI = new ChatHistoryAPI();

// ============ STORE ============

// Add these new types for UI state persistence
export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  isExisting?: boolean;
}

export interface DatabaseFile {
  id: string;
  name: string;
  icon: string;
}

interface ChatStoreState {
  // All chat titles from backend
  chatTitles: ChatTitle[];
  isLoadingTitles: boolean;

  // Full chat data keyed by chat_id - load only when needed
  chats: Record<string, FullChat>;

  // Current active chat
  currentChatId: string | null;
  currentChatMessages: ChatMessage[];
  currentDashboardData: any | null;

  // Track current message ID for the active chat
  currentMessageId: string;

  // UI states
  isLoadingHistory: boolean;

  // Track if this is a brand new unsaved chat
  isNewUnsavedChat: boolean;

  // ===== NEW: UI State for Dashboard =====
  // Selected files state
  selectedFiles: string[];
  uploadedFiles: UploadedFile[];
  availableFiles: DatabaseFile[];

  // Input state
  inputValue: string;
  lastQuery: string;
}

interface ChatStoreActions {
  // Login/Logout flow
  initializeOnLogin: () => Promise<void>;
  cleanupOnLogout: () => void;

  // Chat operations
  fetchChatTitles: () => Promise<void>;
  fetchChatHistory: (chatId: string) => Promise<void>;
  createNewChat: () => string; // Returns new chat_id
  deleteChat: (chatId: string) => Promise<void>;
  updateChatTitle: (
    chatId: string,
    newTitle: string,
  ) => Promise<{ success: boolean; message: string }>;

  // Message operations
  addUserMessage: (query: string, files: string[]) => void;
  addAssistantMessage: (content: string, dashboardData: any) => void;

  // Set current message ID
  setCurrentMessageId: (messageId: string) => void;

  // ===== NEW: UI State Actions =====
  setSelectedFiles: (files: string[] | ((prev: string[]) => string[])) => void;
  setUploadedFiles: (
    files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[]),
  ) => void;
  setAvailableFiles: (
    files: DatabaseFile[] | ((prev: DatabaseFile[]) => DatabaseFile[]),
  ) => void;
  setInputValue: (value: string) => void;
  setLastQuery: (query: string) => void;

  // Utility
  clearAllState: () => void;

  // Getters
  getCurrentChatId: () => string | null;
  getChatTitle: (chatId: string) => string;
  getNextChatId: () => string; // Helper to get next chat ID
}

type ChatStore = ChatStoreState & ChatStoreActions;

const generateTitleFromQuery = (query: string): string => {
  const trimmed = query.trim();
  if (!trimmed) return "New Chat";
  if (trimmed.length <= 40) return trimmed;
  return trimmed.substring(0, 40) + "...";
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // ========== INITIAL STATE ==========
      chatTitles: [],
      isLoadingTitles: false,
      chats: {},
      currentChatId: null,
      currentChatMessages: [],
      currentDashboardData: null,
      currentMessageId: "0",
      isLoadingHistory: false,
      isNewUnsavedChat: false,

      // ===== NEW: UI State Initial Values =====
      selectedFiles: [],
      uploadedFiles: [],
      availableFiles: [],
      inputValue: "",
      lastQuery: "",

      // ========== ACTIONS ==========

      /**
       * CALL THIS ON LOGIN:
       * 1. Clear current chat messages (user sees empty screen)
       * 2. Fetch all titles from backend for sidebar
       * 3. Create a brand new unsaved chat (not yet in backend)
       */
      initializeOnLogin: async () => {
        // (
        //   "🔐 INITIALIZE ON LOGIN: Clearing current chat, fetching titles",
        // );

        set({
          currentChatId: null,
          currentChatMessages: [],
          currentDashboardData: null,
          currentMessageId: "0",
          isNewUnsavedChat: false,
          // Don't clear UI state here - keep files
        });

        await get().fetchChatTitles();

        // Only create new chat if there are no existing chats
        const { chatTitles } = get();
        if (!chatTitles || chatTitles.length === 0) {
          get().createNewChat();
        } else {
          // If there are existing chats, select the most recent one
          const sortedTitles = [...chatTitles].sort((a, b) => {
            const numA = parseInt(a?.chat_id || "0", 10);
            const numB = parseInt(b?.chat_id || "0", 10);
            return numB - numA;
          });

          if (sortedTitles[0]?.chat_id) {
            await get().fetchChatHistory(sortedTitles[0].chat_id);
          }
        }

        // ("✅ Login initialization complete");
      },

      /**
       * CALL THIS ON LOGOUT:
       * Clear only the current selection, NOT the chat history
       * Keep chat history so it can be loaded when user logs back in
       */
      cleanupOnLogout: () => {
        // (
        //   "🚪 CLEANUP ON LOGOUT: Clearing current selection only, keeping chat history",
        // );
        set({
          // KEEP chatTitles and chats for when user logs back in
          // ONLY clear the current session state
          currentChatId: null,
          currentChatMessages: [],
          currentDashboardData: null,
          currentMessageId: "0",
          isLoadingTitles: false,
          isNewUnsavedChat: false,
          // Don't clear UI state on logout
        });
      },

      /**
       * Fetch all chat titles from backend
       * This populates the sidebar
       */
      fetchChatTitles: async () => {
        set({ isLoadingTitles: true });

        try {
          const titles = await chatHistoryAPI.fetchChatTitles();
          // ("📋 Fetched chat titles from backend:", titles);

          // Ensure titles is always an array
          const safeTitles = Array.isArray(titles) ? titles : [];

          set({
            chatTitles: safeTitles,
            isLoadingTitles: false,
          });
        } catch (error) {
         
          set({
            chatTitles: [],
            isLoadingTitles: false,
          });
        }
      },

      /**
       * Get the next available chat ID (increments by 1 as string)
       */
      getNextChatId: () => {
        const { chatTitles } = get();
        const safeChatTitles = Array.isArray(chatTitles) ? chatTitles : [];

        let maxChatId = 0;
        safeChatTitles.forEach((title) => {
          if (title && title.chat_id) {
            const num = parseInt(title.chat_id, 10);
            if (!isNaN(num) && num > maxChatId) {
              maxChatId = num;
            }
          }
        });

        // Also check chats object for any unsaved chats
        const { chats } = get();
        Object.keys(chats).forEach((chatId) => {
          const num = parseInt(chatId, 10);
          if (!isNaN(num) && num > maxChatId) {
            maxChatId = num;
          }
        });

        return (maxChatId + 1).toString();
      },

      /**
       * Set the current message ID for the active chat
       */
      setCurrentMessageId: (messageId: string) => {
        // (`📝 Setting current message ID to: ${messageId}`);
        set({ currentMessageId: messageId });
      },

      /**
       * Fetch full chat history when user clicks on a chat in sidebar
       */
      fetchChatHistory: async (chatId: string) => {
        if (!chatId) {
          
          return;
        }

        // (`📜 Fetching history for chat: ${chatId}`);
        set({ isLoadingHistory: true });

        try {
          const history = await chatHistoryAPI.fetchChatHistory(chatId);

          const { chatTitles } = get();
          const safeChatTitles = Array.isArray(chatTitles) ? chatTitles : [];
          const chatTitle =
            safeChatTitles.find((t) => t?.chat_id === chatId)?.title ||
            "Untitled Chat";

          const messages: ChatMessage[] = [];

          if (Array.isArray(history)) {
            history.forEach((item, index) => {
              // Handle user message
              if (item?.role === "user" || item?.content?.query) {
                const query = item.content?.query || item.query || "";
                const files = item.files || [];

                messages.push({
                  id: item.message_id || `msg-${chatId}-${index}-user`,
                  chat_id: chatId,
                  query: query,
                  files: files,
                  response: undefined,
                  timestamp: new Date(item.created_at || Date.now()),
                  role: "user",
                  content: query,
                });
              }

              // Handle assistant/bot message
              if (item?.role === "bot" || item?.content?.result) {
                const result = item.content?.result || item.result || {};
                const task_id = item.content?.task_id || item.task_id;

                // Use content from result if available
                const assistantContent =
                  result.content || "Dashboard generated successfully! ✨";

                messages.push({
                  id: item.message_id || `msg-${chatId}-${index}-assistant`,
                  chat_id: chatId,
                  query: "",
                  files: [],
                  response: result,
                  timestamp: new Date(item.created_at || Date.now()),
                  role: "assistant",
                  content: assistantContent,
                });
              }
            });
          }

          const lastAssistantMsg = [...messages]
            .reverse()
            .find((m) => m.role === "assistant");

          // Calculate current message ID based on number of message pairs
          const messagePairs = Math.ceil(messages.length / 2);
          const currentMessageId = messagePairs.toString();

          set((state) => ({
            chats: {
              ...state.chats,
              [chatId]: {
                chat_id: chatId,
                title: chatTitle,
                messages,
                createdAt: messages[0]?.timestamp || new Date(),
                updatedAt:
                  messages[messages.length - 1]?.timestamp || new Date(),
              },
            },
            currentChatId: chatId,
            currentChatMessages: messages,
            currentDashboardData: lastAssistantMsg?.response || null,
            currentMessageId: currentMessageId,
            isLoadingHistory: false,
            isNewUnsavedChat: false,
          }));

          // (
          //   `✅ Loaded chat ${chatId} with ${messages.length} messages, message ID: ${currentMessageId}`,
          // );
        } catch (error) {
          
          set({ isLoadingHistory: false });
        }
      },

      /**
       * Create a new chat - UNSAVED, not in backend yet
       */
      createNewChat: () => {
        const newChatId = get().getNextChatId();
        // (`🆕 Creating NEW UNSAVED chat with ID: ${newChatId}`);

        set({
          currentChatId: newChatId,
          currentChatMessages: [],
          currentDashboardData: null,
          currentMessageId: "0",
          isNewUnsavedChat: true,
        });

        return newChatId;
      },

      /**
       * Delete a chat
       * ✅ FIX: API is called FIRST. UI only updates AFTER confirmed success.
       * Old code did optimistic update first then rollback on failure — caused UI flash.
       */
      deleteChat: async (chatId: string) => {
        if (!chatId) return;

   

        const { currentChatId } = get();
        const wasCurrentChat = currentChatId === chatId;

        // ✅ Call API FIRST — no optimistic update
        const response = await useDeleteChatStore.getState().deleteChat({
          chat_id: chatId,
        });

        if (response.success) {
      

          // ✅ Only update UI AFTER API confirms success
          set((state) => {
            const safeChatTitles = Array.isArray(state.chatTitles)
              ? state.chatTitles
              : [];
            const updatedTitles = safeChatTitles.filter(
              (t) => t?.chat_id !== chatId,
            );
            const updatedChats = { ...state.chats };
            delete updatedChats[chatId];

            const newState: Partial<ChatStoreState> = {
              chatTitles: updatedTitles,
              chats: updatedChats,
            };

            // If we deleted the currently open chat, clear it
            if (wasCurrentChat) {
              newState.currentChatId = null;
              newState.currentChatMessages = [];
              newState.currentDashboardData = null;
              newState.currentMessageId = "0";
            }

            return newState;
          });

          // If the deleted chat was active, open a fresh new chat
          if (wasCurrentChat) {
            setTimeout(() => get().createNewChat(), 0);
          }
        } else {
          // ✅ API returned success: false — throw so ChatSidebar can show error toast
          throw new Error(response.message || "Failed to delete chat");
        }
      },

      /**
       * Update chat title
       * ✅ FIX: API is called FIRST. UI only updates AFTER confirmed success.
       * Old code did optimistic update first then rollback on failure — caused UI flash.
       */
      updateChatTitle: async (chatId: string, newTitle: string) => {
        if (!chatId || !newTitle.trim()) {
          return { success: false, message: "Invalid chat ID or title" };
        }

        // (`✏️ Renaming chat ${chatId} to: ${newTitle}`);

        try {
          // ✅ Call API FIRST — no optimistic update
          const response = await useUpdateTitleStore.getState().updateTitle({
            chat_id: chatId,
            title: newTitle,
          });

          if (response.success) {
            // ("✅ Title updated in backend:", response);

            // ✅ Only update UI AFTER API confirms success
            set((state) => {
              const safeChatTitles = Array.isArray(state.chatTitles)
                ? state.chatTitles
                : [];
              const updatedTitles = safeChatTitles.map((chat) =>
                chat?.chat_id === chatId ? { ...chat, title: newTitle } : chat,
              );

              const updatedChats = { ...state.chats };
              if (updatedChats[chatId]) {
                updatedChats[chatId] = {
                  ...updatedChats[chatId],
                  title: newTitle,
                };
              }

              return {
                chatTitles: updatedTitles,
                chats: updatedChats,
              };
            });

            return { success: true, message: "Chat renamed successfully" };
          } else {
            // ✅ API returned success: false — no UI change, return error for toast
            return {
              success: false,
              message: response.message || "Failed to update title",
            };
          }
        } catch (error) {
  
          // No UI change — return error for toast
          return {
            success: false,
            message:
              error instanceof Error ? error.message : "Failed to rename chat",
          };
        }
      },

      /**
       * Add a user message to the current chat
       */
      addUserMessage: (query: string, files: string[]) => {
        const {
          currentChatId,
          currentChatMessages,
          isNewUnsavedChat,
          currentMessageId,
        } = get();

        if (!currentChatId) {
          
          return;
        }

        // Increment message ID for user message
        const nextMessageId = (parseInt(currentMessageId) + 1).toString();

        const newMessage: ChatMessage = {
          id: `msg-${currentChatId}-${Date.now()}-user`,
          chat_id: currentChatId,
          query,
          files: files || [],
          response: undefined,
          timestamp: new Date(),
          role: "user",
          content: query,
        };

        const updatedMessages = [...currentChatMessages, newMessage];

        set({
          currentChatMessages: updatedMessages,
          currentMessageId: nextMessageId,
        });

        set((state) => {
          const safeChatTitles = Array.isArray(state.chatTitles)
            ? state.chatTitles
            : [];
          const existingChat = state.chats[currentChatId] || {
            chat_id: currentChatId,
            title: "New Chat",
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          let chatTitle = existingChat.title;

          // Generate title from first user message in a new chat
          if (updatedMessages.length === 1 && isNewUnsavedChat) {
            chatTitle = generateTitleFromQuery(query);

            // Check if title already exists in chatTitles
            const titleExists = safeChatTitles.some(
              (t) => t?.chat_id === currentChatId,
            );

            if (!titleExists) {
              // Add to chatTitles array
              state.chatTitles = [
                ...safeChatTitles,
                {
                  chat_id: currentChatId,
                  title: chatTitle,
                },
              ];

              // Sort by newest first (highest chat_id first)
              state.chatTitles.sort((a, b) => {
                const numA = parseInt(a?.chat_id || "0", 10);
                const numB = parseInt(b?.chat_id || "0", 10);
                return numB - numA;
              });
            }
          }

          return {
            chats: {
              ...state.chats,
              [currentChatId]: {
                ...existingChat,
                title: chatTitle,
                messages: updatedMessages,
                updatedAt: new Date(),
              },
            },
            isNewUnsavedChat: false,
          };
        });

        // (
        //   `✅ Added user message to chat ${currentChatId}, message ID now: ${nextMessageId}`,
        // );
      },

      /**
       * Add an assistant message with dashboard data
       */
      addAssistantMessage: (content: string, dashboardData: any) => {
        const { currentChatId, currentChatMessages, currentMessageId } = get();

        if (!currentChatId) {
     
          return;
        }

        // Increment message ID for assistant message
        const nextMessageId = (parseInt(currentMessageId) + 1).toString();

        const newMessage: ChatMessage = {
          id: `msg-${currentChatId}-${Date.now()}-assistant`,
          chat_id: currentChatId,
          query: "",
          files: [],
          response: dashboardData,
          timestamp: new Date(),
          role: "assistant",
          content: content || "Dashboard generated successfully! ✨",
        };

        const updatedMessages = [...currentChatMessages, newMessage];

        set({
          currentChatMessages: updatedMessages,
          currentDashboardData: dashboardData,
          currentMessageId: nextMessageId,
        });

        set((state) => {
          const existingChat = state.chats[currentChatId] || {
            chat_id: currentChatId,
            title: "New Chat",
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return {
            chats: {
              ...state.chats,
              [currentChatId]: {
                ...existingChat,
                messages: updatedMessages,
                updatedAt: new Date(),
              },
            },
          };
        });

        // (
        //   `✅ Added assistant message to chat ${currentChatId}, message ID now: ${nextMessageId}`,
        // );
      },

      // ===== NEW: UI State Actions =====
      setSelectedFiles: (files) =>
        set((state) => ({
          selectedFiles:
            typeof files === "function" ? files(state.selectedFiles) : files,
        })),

      setUploadedFiles: (files) =>
        set((state) => ({
          uploadedFiles:
            typeof files === "function" ? files(state.uploadedFiles) : files,
        })),

      setAvailableFiles: (files) =>
        set((state) => ({
          availableFiles:
            typeof files === "function" ? files(state.availableFiles) : files,
        })),

      setInputValue: (value) => set({ inputValue: value }),
      setLastQuery: (query) => set({ lastQuery: query }),

      clearAllState: () =>
        set({
          selectedFiles: [],
          uploadedFiles: [],
          availableFiles: [],
          inputValue: "",
          lastQuery: "",
          currentChatId: null,
          currentChatMessages: [],
          currentDashboardData: null,
          currentMessageId: "0",
          isNewUnsavedChat: false,
        }),

      // ========== GETTERS ==========

      getCurrentChatId: () => get().currentChatId,

      getChatTitle: (chatId: string) => {
        const { chatTitles } = get();
        const safeChatTitles = Array.isArray(chatTitles) ? chatTitles : [];
        return (
          safeChatTitles.find((t) => t?.chat_id === chatId)?.title ||
          "Untitled Chat"
        );
      },
    }),
    {
      name: "chat-history-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Chat related
        chatTitles: state.chatTitles,
        chats: state.chats,
        currentChatId: state.currentChatId,
        currentChatMessages: state.currentChatMessages,
        currentDashboardData: state.currentDashboardData,
        currentMessageId: state.currentMessageId,

        // UI State
        selectedFiles: state.selectedFiles,
        uploadedFiles: state.uploadedFiles,
        availableFiles: state.availableFiles,
        inputValue: state.inputValue,
        // Do NOT persist lastQuery - we don't want the last query
        // to be restored after refresh; only file selections should persist
      }),
    },
  ),
);
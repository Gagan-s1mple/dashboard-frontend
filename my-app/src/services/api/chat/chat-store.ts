/* eslint-disable @typescript-eslint/no-explicit-any */
import { url } from "../api-url";
import { toast } from "sonner";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch chat titles:", error);
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

      console.log("📤 Fetching history for chat:", chatId);

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

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        console.error(" Failed to fetch history");
        return [];
      }

      const data = await response.json();
      console.log("Chat history received:", data);

      // ✅ FIX: Extract messages from the nested structure
      if (data && data.chats && data.chats.messages) {
        return data.chats.messages;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        console.warn("Unexpected response format:", data);
        return [];
      }
    } catch (error) {
      console.error(` Failed to fetch history for chat ${chatId}:`, error);
      return [];
    }
  }
}

export const chatHistoryAPI = new ChatHistoryAPI();

// ============ STORE ============

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

  // ✅ ADD THIS - Track current message ID for the active chat
  currentMessageId: string;

  // UI states
  isLoadingHistory: boolean;

  // Track if this is a brand new unsaved chat
  isNewUnsavedChat: boolean;
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

  // Message operations
  addUserMessage: (query: string, files: string[]) => void;
  addAssistantMessage: (content: string, dashboardData: any) => void;

  // ✅ ADD THIS - Set current message ID
  setCurrentMessageId: (messageId: string) => void;

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
      currentMessageId: "0", // ✅ ADD THIS - Start with message_id = "0"
      isLoadingHistory: false,
      isNewUnsavedChat: false,

      // ========== ACTIONS ==========

      /**
       * CALL THIS ON LOGIN:
       * 1. Clear current chat messages (user sees empty screen)
       * 2. Fetch all titles from backend for sidebar
       * 3. Create a brand new unsaved chat (not yet in backend)
       */
      initializeOnLogin: async () => {
        console.log(
          "🔐 INITIALIZE ON LOGIN: Clearing current chat, fetching titles",
        );

        set({
          currentChatId: null,
          currentChatMessages: [],
          currentDashboardData: null,
          currentMessageId: "0", // ✅ ADD THIS - Reset to 0 on login
          isNewUnsavedChat: false,
        });

        await get().fetchChatTitles();
        get().createNewChat();

        console.log("✅ Login initialization complete - fresh new chat ready");
      },

      /**
       * CALL THIS ON LOGOUT:
       * Clear only the current selection, NOT the chat history
       * Keep chat history so it can be loaded when user logs back in
       */
      cleanupOnLogout: () => {
        console.log(
          "🚪 CLEANUP ON LOGOUT: Clearing current selection only, keeping chat history",
        );
        set({
          // ✅ KEEP chatTitles and chats for when user logs back in
          // ✅ ONLY clear the current session state
          currentChatId: null,
          currentChatMessages: [],
          currentDashboardData: null,
          currentMessageId: "0", // ✅ ADD THIS - Reset on logout
          isLoadingTitles: false,
          isNewUnsavedChat: false,
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
          console.log("📋 Fetched chat titles from backend:", titles);

          // Ensure titles is always an array
          const safeTitles = Array.isArray(titles) ? titles : [];

          set({
            chatTitles: safeTitles,
            isLoadingTitles: false,
          });
        } catch (error) {
          console.error("Failed to fetch titles:", error);
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
        console.log(`📝 Setting current message ID to: ${messageId}`);
        set({ currentMessageId: messageId });
      },

      /**
       * Fetch full chat history when user clicks on a chat in sidebar
       */
      fetchChatHistory: async (chatId: string) => {
        if (!chatId) {
          console.error("❌ No chat ID provided");
          return;
        }

        console.log(`📜 Fetching history for chat: ${chatId}`);
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
              // ✅ Handle user message
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

              // ✅ Handle assistant/bot message
              if (item?.role === "bot" || item?.content?.result) {
                const result = item.content?.result || item.result || {};
                const task_id = item.content?.task_id || item.task_id;

                messages.push({
                  id: item.message_id || `msg-${chatId}-${index}-assistant`,
                  chat_id: chatId,
                  query: "",
                  files: [],
                  response: result,
                  timestamp: new Date(item.created_at || Date.now()),
                  role: "assistant",
                  content: "Dashboard generated successfully! ✨",
                });
              }
            });
          }

          const lastAssistantMsg = [...messages]
            .reverse()
            .find((m) => m.role === "assistant");

          // ✅ Calculate current message ID based on number of message pairs
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
            currentMessageId: currentMessageId, // ✅ SET the message ID
            isLoadingHistory: false,
            isNewUnsavedChat: false,
          }));

          console.log(
            `✅ Loaded chat ${chatId} with ${messages.length} messages, message ID: ${currentMessageId}`,
          );
        } catch (error) {
          console.error(`Failed to fetch history for chat ${chatId}:`, error);
          set({ isLoadingHistory: false });
          toast.error("Failed to load chat history");
        }
      },

      /**
       * Create a new chat - UNSAVED, not in backend yet
       */
      createNewChat: () => {
        const newChatId = get().getNextChatId();
        console.log(`🆕 Creating NEW UNSAVED chat with ID: ${newChatId}`);

        set({
          currentChatId: newChatId,
          currentChatMessages: [],
          currentDashboardData: null,
          currentMessageId: "0", // ✅ ADD THIS - Reset to 0 for new chat
          isNewUnsavedChat: true,
        });

        toast.success("New chat started", { duration: 2000 });
        return newChatId;
      },

      /**
       * Delete a chat
       */
      deleteChat: async (chatId: string) => {
        if (!chatId) return;

        set((state) => {
          const safeChatTitles = Array.isArray(state.chatTitles)
            ? state.chatTitles
            : [];
          const updatedTitles = safeChatTitles.filter(
            (t) => t?.chat_id !== chatId,
          );
          const updatedChats = { ...state.chats };
          delete updatedChats[chatId];

          if (state.currentChatId === chatId) {
            setTimeout(() => get().createNewChat(), 0);
          }

          return {
            chatTitles: updatedTitles,
            chats: updatedChats,
            currentChatId:
              state.currentChatId === chatId ? null : state.currentChatId,
            currentChatMessages:
              state.currentChatId === chatId ? [] : state.currentChatMessages,
            currentDashboardData:
              state.currentChatId === chatId
                ? null
                : state.currentDashboardData,
            currentMessageId:
              state.currentChatId === chatId ? "0" : state.currentMessageId,
            isNewUnsavedChat:
              state.currentChatId === chatId ? true : state.isNewUnsavedChat,
          };
        });

        toast.success("Chat deleted", { duration: 2000 });
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
          console.error("No current chat selected");
          return;
        }

        // ✅ Increment message ID for user message
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
          currentMessageId: nextMessageId, // ✅ Update message ID
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

        console.log(
          `✅ Added user message to chat ${currentChatId}, message ID now: ${nextMessageId}`,
        );
      },

      /**
       * Add an assistant message with dashboard data
       */
      addAssistantMessage: (content: string, dashboardData: any) => {
        const { currentChatId, currentChatMessages, currentMessageId } = get();

        if (!currentChatId) {
          console.error("No current chat selected");
          return;
        }

        // ✅ Increment message ID for assistant message
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
          currentMessageId: nextMessageId, // ✅ Update message ID
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

        console.log(
          `✅ Added assistant message to chat ${currentChatId}, message ID now: ${nextMessageId}`,
        );
      },

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
        chatTitles: state.chatTitles,
        chats: state.chats,
        currentMessageId: state.currentMessageId, // ✅ ADD THIS - Persist message ID
      }),
    },
  ),
);

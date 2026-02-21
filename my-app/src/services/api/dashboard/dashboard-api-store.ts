/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { url } from "../api-url";
import { create } from "zustand";
import { useChatStore } from "../chat/chat-store"; // IMPORT the chat store

export interface KPI {
  title: string;
  value: string;
  description: string;
}

export interface ChartOption {
  title: { text: string; left: string };
  tooltip: any;
  legend?: any;
  xAxis?: any;
  yAxis?: any;
  series: any[];
  [key: string]: any;
}

export interface DashboardBackendResponse {
  kpis: KPI[];
  charts: ChartOption[];
  content?: string; // Add content field
  table?: any[]; // Add table field for tabular data
}

export interface TaskStatus {
  task_id?: string; // Made optional since backend doesn't return it
  status: "pending" | "processing" | "completed" | "failed";
  result?: DashboardBackendResponse; // Backend returns result
  data?: DashboardBackendResponse; // Keep for backward compatibility
}

export class DashboardAPI {
  private baseUrl: string;
  private chatId: string; // Changed to string
  private messageId: string; // Changed to string

  constructor(
    baseUrl: string = `${url.backendUrl}`,
    chatId: string = "1",
    messageId: string = "0",
  ) {
    this.baseUrl = baseUrl;
    this.chatId = chatId;
    this.messageId = messageId;
  }

  // Setter methods to update chat_id and message_id
  setChatId(chatId: string) {
    this.chatId = chatId;
  }

  setMessageId(messageId: string) {
    this.messageId = messageId;
  }

  // Getter methods
  getChatId(): string {
    return this.chatId;
  }

  getMessageId(): string {
    return this.messageId;
  }

  // Helper method to format message_id as U_chatId_0000
  getFormattedMessageId(): string {
    // Parse messageId as number for padding, then convert back to string
    const messageIdNum = parseInt(this.messageId, 10);
    if (isNaN(messageIdNum)) {
      console.warn("⚠️ messageId is not a valid number:", this.messageId);
      return `U_${this.chatId}_${this.messageId}`;
    }

    // Format message_id with leading zeros (4 digits)
    const paddedMessageId = messageIdNum.toString().padStart(4, "0");
    return `U_${this.chatId}_${paddedMessageId}`;
  }

  // Increment message_id for new messages
  incrementMessageId() {
    // Parse as number, increment, then convert back to string
    const currentId = parseInt(this.messageId, 10);
    if (isNaN(currentId)) {
      console.warn(
        "⚠️ messageId is not a valid number, resetting to 0:",
        this.messageId,
      );
      this.messageId = "0";
    } else {
      this.messageId = (currentId + 1).toString();
    }
  }

  // Reset message_id to 0 for new chat
  resetMessageId() {
    this.messageId = "0";
  }

  /**
   * Fetch dashboard data from backend
   */
  async fetchDashboardData(
    message: string,
    file_name: string,
  ): Promise<DashboardBackendResponse> {
    try {
      // Increment message_id for new message
      this.incrementMessageId();

      const requestBody = {
        message,
        file_name,
        chat_id: this.chatId,
        message_id: this.getFormattedMessageId(), // Use formatted message_id
        // ✅ FIX: Use the actual query as title instead of hardcoded "Dashboard Query"
        title: message, // Use the user's query as the title
      };

      const startTime = performance.now();
      const getAuthToken = (): string | null => {
        return localStorage.getItem("auth_token");
      };

      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication required. Please login first.");
      }

      const response = await fetch(`${this.baseUrl}/llm/dashboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      if (!response.ok) {
     
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // Handle different response formats from backend
      let kpis: KPI[] = [];
      let charts: ChartOption[] = [];
      let content: string | undefined = undefined;
      let table: any[] | undefined = undefined;

      if (Array.isArray(responseData)) {
        // Backend returns array of KPIs (no charts yet)
        // We'll accept this and frontend will handle empty charts
        kpis = responseData;
        charts = []; // Empty charts array - frontend will handle this
      } else if (
        responseData.kpis ||
        responseData.charts ||
        responseData.content ||
        responseData.table
      ) {
        // Backend returns structured object with kpis, charts, content, and table
        kpis = responseData.kpis || [];
        charts = responseData.charts || [];
        content = responseData.content;
        table = responseData.table;
      } else {

        throw new Error("Invalid response format");
      }

      // Log detailed KPI info

      kpis.forEach((kpi: KPI, index: number) => {});

      // Log detailed chart info

      charts.forEach((chart: ChartOption, index: number) => {});

      // Log content and table if present
      if (content) {
       
      }

      if (table) {

      }

      console.groupEnd();

      // Return EXACTLY what backend provides (or transformed to our interface)
      return {
        kpis,
        charts,
        content,
        table,
      };
    } catch (error) {
     

      throw error;
    }
  }

  /**
   * Get task status (for polling)
   */
  async getTaskStatus(taskId: string, messageId?: string): Promise<TaskStatus> {


    try {
      const startTime = performance.now();
      const getAuthToken = (): string | null => {
        return localStorage.getItem("auth_token");
      };

      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication required. Please login first.");
      }

      // Use provided messageId or fall back to current one
      const messageIdToUse = messageId || this.getFormattedMessageId();

      // Add chat_id and formatted message_id as query parameters
      const urlWithParams = `${this.baseUrl}/llm/dashboard/${taskId}?chat_id=${this.chatId}&message_id=${messageIdToUse}`;

      const response = await fetch(urlWithParams, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData: TaskStatus = await response.json();

      console.groupEnd();
      return responseData;
    } catch (error) {

      throw error;
    }
  }

  /**
   * Create dashboard task (initial request that returns task ID)
   */
  async createDashboardTask(
    message: string,
    file_name: string,
    chatTitle?: string, // Add optional chatTitle parameter
  ): Promise<{ task_id: string }> {


    try {
 

      const requestBody: any = {
        message,
        file_name,
        chat_id: this.chatId,
        message_id: this.getFormattedMessageId(), // Use formatted message_id
      };


      if (
        chatTitle &&
        chatTitle.trim() !== "" &&
        chatTitle !== "New Chat" &&
        chatTitle !== "Untitled Chat"
      ) {
        requestBody.title = chatTitle;
      } else {
        // Use the actual user query as the title
        requestBody.title = message; // Use the query as title instead of hardcoded text
      }



      const startTime = performance.now();
      const getAuthToken = (): string | null => {
        return localStorage.getItem("auth_token");
      };

      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication required. Please login first.");
      }

      const response = await fetch(`${this.baseUrl}/llm/dashboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);



      if (!response.ok) {

        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();


      if (!responseData.task_id) {
     
        throw new Error("No task_id received from server");
      }

      
      return { task_id: responseData.task_id };
    } catch (error) {

      throw error;
    }
  }
}

export const dashboardAPI = new DashboardAPI();


interface ChatMessage {
  id: string; // Changed to string
  chat_id: string; // Changed to string
  query: string;
  files: string[];
  response?: DashboardBackendResponse;
  timestamp: Date;
}

interface DashboardState {
  loading: boolean;
  hasData: boolean;
  dashboardData: DashboardBackendResponse;
  currentTaskId: string | null;
  polling: boolean;
  pollIntervalId: NodeJS.Timeout | null;
  currentChatId: string; // Changed to string
  currentMessageId: string; // Changed to string
  chatHistory: ChatMessage[];
  fetchDashboardData: (
    query: string,
    file_name: string,
    chatTitle?: string,
  ) => Promise<void>;
  stopPolling: () => void;
  resetDashboard: () => void;
  pollTaskStatus: (taskId: string, messageIdOverride?: string) => Promise<void>;
  resumePollingIfNeeded: () => void;
  addToChatHistory: (
    query: string,
    files: string[],
    response?: DashboardBackendResponse,
  ) => void;
  startNewChat: () => void;
  loadChat: (chatId: string) => void; // Changed to string
  getCurrentQuery: () => string;
  getCurrentFiles: () => string[];
  setCurrentQueryAndFiles: (query: string, files: string[]) => void;
  setChatInfo: (chatId: string, messageId: string) => void;
}

const INITIAL_DASHBOARD_DATA: DashboardBackendResponse = {
  kpis: [],
  charts: [],
  content: "",
  table: [],
};

// Temporary storage for current query and files during polling
let currentQueryCache = "";
let currentFilesCache: string[] = [];

export const useDashboardStore = create<DashboardState>((set, get) => ({
  loading: false,
  hasData: false,
  dashboardData: INITIAL_DASHBOARD_DATA,
  currentTaskId: null,
  polling: false,
  pollIntervalId: null,
  currentChatId: "1", // Start with chat_id = "1" as string
  currentMessageId: "0", // Start with message_id = "0" as string
  chatHistory: [],

  setChatInfo: (chatId: string, messageId: string) => {
  
    set({ currentChatId: chatId, currentMessageId: messageId });
    dashboardAPI.setChatId(chatId);
    dashboardAPI.setMessageId(messageId);
  },

  fetchDashboardData: async (
    query: string,
    file_name: string,
    chatTitle?: string,
  ) => {
 

    // Get current chat ID from chat store
    const currentChatId = useChatStore.getState().currentChatId;

    // Update the API instance with current chat_id
    if (currentChatId) {
      dashboardAPI.setChatId(currentChatId);
      set({ currentChatId });
    }

    // Get the CURRENT message ID before incrementing
    const currentMessageId = get().currentMessageId;


    // Store current query and files for chat history
    currentQueryCache = query;
    currentFilesCache = file_name.split(",");

    // Update the API instance with current chat_id and message_id
    dashboardAPI.setChatId(get().currentChatId);
    dashboardAPI.setMessageId(currentMessageId); // Use current message ID, not incremented yet

    set({ loading: true, hasData: false });

    try {

      const { task_id } = await dashboardAPI.createDashboardTask(
        query,
        file_name,
        chatTitle,
      );

  

      // AFTER successful task creation, increment the message ID for NEXT query
      const nextMessageId = (parseInt(currentMessageId, 10) + 1).toString();

      set({ currentMessageId: nextMessageId });
      dashboardAPI.setMessageId(nextMessageId);

      // Step 2: Store task ID and start polling
      const chatId = get().currentChatId;
      const messageIdUsed = currentMessageId; // Before increment
      set({
        currentTaskId: task_id,
        polling: true,
        loading: false, // We're not loading anymore, we're polling
      });

      // Persist for resume on refresh/navigation - use localStorage for cross-session persistence
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(
          "adro_polling_task",
          JSON.stringify({ taskId: task_id, chatId, messageId: messageIdUsed })
        );
      }

      // Refresh sidebar so new chat appears
      useChatStore.getState().fetchChatTitles();

      // Step 3: Start polling for this task (pass messageId used for task creation)
      get().pollTaskStatus(task_id, messageIdUsed);
    } catch (error) {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("adro_polling_task");
      }
      set({
        dashboardData: INITIAL_DASHBOARD_DATA,
        hasData: false,
        loading: false,
        polling: false,
        currentTaskId: null,
      });
    }
  },

  pollTaskStatus: async (taskId: string, messageIdOverride?: string) => {
    // Use the message ID from when the task was created (for correct backend lookup)
    const msgId = messageIdOverride ?? get().currentMessageId;
    dashboardAPI.setMessageId(msgId);
    const originalFormattedMessageId = dashboardAPI.getFormattedMessageId();



    const poll = async () => {
      const { polling } = get();
      if (!polling) {

        return;
      }

      try {
        

        // PASS THE ORIGINAL MESSAGE-ID TO getTaskStatus
        const taskStatus = await dashboardAPI.getTaskStatus(
          taskId,
          originalFormattedMessageId,
        );



        switch (taskStatus.status) {
          case "completed": {
            // Check both result and data fields
            const dashboardResult = taskStatus.result || taskStatus.data;

            if (typeof localStorage !== "undefined") {
              localStorage.removeItem("adro_polling_task");
            }
            useChatStore.getState().fetchChatTitles();

            if (dashboardResult) {
              set({
                dashboardData: dashboardResult,
                hasData: true,
                loading: false,
                polling: false,
                currentTaskId: null,
              });
            } else {
              set({
                dashboardData: INITIAL_DASHBOARD_DATA,
                hasData: false,
                loading: false,
                polling: false,
                currentTaskId: null,
              });
            }
            break;
          }

          case "failed": {
            if (typeof localStorage !== "undefined") {
              localStorage.removeItem("adro_polling_task");
            }
            set({
              dashboardData: INITIAL_DASHBOARD_DATA,
              hasData: false,
              loading: false,
              polling: false,
              currentTaskId: null,
            });
            break;
          }

          case "pending":
          case "processing":
            setTimeout(() => {
              if (get().polling && get().currentTaskId === taskId) {
                get().pollTaskStatus(taskId, msgId);
              }
            }, 10000);
            break;

          default:
            setTimeout(() => {
              if (get().polling && get().currentTaskId === taskId) {
                get().pollTaskStatus(taskId, msgId);
              }
            }, 10000);
            break;
        }
      } catch (error) {
        throw error;
  
      }
    };


    poll();
  },

  // Add new message to chat history - NOW SYNCING WITH CHAT STORE
  addToChatHistory: (
    query: string,
    files: string[],
    response?: DashboardBackendResponse,
  ) => {
    const state = get();

    // Convert messageId to number, increment, then back to string
    const currentId = parseInt(state.currentMessageId, 10);
    const newMessageId = isNaN(currentId) ? "1" : (currentId + 1).toString();

    const newMessage: ChatMessage = {
      id: newMessageId,
      chat_id: state.currentChatId,
      query,
      files,
      response,
      timestamp: new Date(),
    };


    set({
      currentMessageId: newMessageId,
      chatHistory: [...state.chatHistory, newMessage],
    });


    if (response) {

      const assistantMessage =
        response.content || "Dashboard generated successfully! ✨";
      useChatStore.getState().addAssistantMessage(assistantMessage, response);
    }
  },

  // Start a new chat session
  startNewChat: () => {
    // First create new chat in chat store to get the new ID
    const newChatId = useChatStore.getState().createNewChat();

    // Reset message counter for new chat
    dashboardAPI.setChatId(newChatId);
    dashboardAPI.resetMessageId();



    set({
      currentChatId: newChatId,
      currentMessageId: "0",
      chatHistory: [],
      hasData: false,
      dashboardData: INITIAL_DASHBOARD_DATA,
      loading: false,
      polling: false,
      currentTaskId: null,
    });

    // Clear cache
    currentQueryCache = "";
    currentFilesCache = [];


  },

  // Load a specific chat from history
  loadChat: (chatId: string) => {
    const state = get();
    const chatMessages = state.chatHistory.filter(
      (msg) => msg.chat_id === chatId,
    );

    if (chatMessages.length > 0) {
      const lastMessage = chatMessages[chatMessages.length - 1];

      // Update API instance
      dashboardAPI.setChatId(chatId);
      dashboardAPI.setMessageId(lastMessage.id);

      set({
        currentChatId: chatId,
        currentMessageId: lastMessage.id,
        dashboardData: lastMessage.response || INITIAL_DASHBOARD_DATA,
        hasData: !!lastMessage.response,
      });

      // Also load in chat store
      useChatStore.getState().fetchChatHistory(chatId);


    } else {

    }
  },

  // Get current query (for debugging)
  getCurrentQuery: () => currentQueryCache,

  // Get current files (for debugging)
  getCurrentFiles: () => currentFilesCache,

  // Set current query and files (for manual updates)
  setCurrentQueryAndFiles: (query: string, files: string[]) => {
    currentQueryCache = query;
    currentFilesCache = files;
  },

  stopPolling: () => {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem("adro_polling_task");
    }
    set({
      polling: false,
      currentTaskId: null,
      loading: false,
    });
  },

  resumePollingIfNeeded: () => {
    if (typeof localStorage === "undefined") return;
    try {
      const stored = localStorage.getItem("adro_polling_task");
      if (!stored) return;
      const { taskId, chatId, messageId } = JSON.parse(stored);
      if (!taskId || !chatId) return;
      // Restore chat context
      dashboardAPI.setChatId(chatId);
      dashboardAPI.setMessageId(messageId || "0");
      set({ currentChatId: chatId, currentMessageId: messageId || "0" });
      set({ currentTaskId: taskId, polling: true, loading: false });
      get().pollTaskStatus(taskId, messageId);
    } catch {
      localStorage.removeItem("adro_polling_task");
    }
  },

  resetDashboard: () => {

    set({
      hasData: false,
      dashboardData: INITIAL_DASHBOARD_DATA,
      loading: false,
      polling: false,
      currentTaskId: null,
    });
  },
}));

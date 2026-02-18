/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { url } from "../api-url";

export interface deleteChatAPI {
  chat_id: string;
}

export interface DeleteChatResponse {
  success: boolean;
  message: string;
  chat_id?: string;
}

interface DeleteChatState {
  loading: boolean;
  error: string | null;
  deleteChat: (payload: deleteChatAPI) => Promise<DeleteChatResponse>;
}

const getAuthToken = (): string | null => localStorage.getItem("auth_token");

const parseErrorMessage = async (response: Response): Promise<string> => {
  const errorText = await response.text();
  try {
    const errorJson = JSON.parse(errorText);
    if (errorJson.detail && Array.isArray(errorJson.detail)) {
      return errorJson.detail.map((err: any) => err.msg).join(", ");
    }
    return errorJson.message || errorJson.detail || errorText;
  } catch {
    return errorText || `Request failed: ${response.status} ${response.statusText}`;
  }
};

export const useDeleteChatStore = create<DeleteChatState>((set) => ({
  loading: false,
  error: null,

  deleteChat: async (payload: deleteChatAPI): Promise<DeleteChatResponse> => {
    set({ loading: true, error: null });

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required. Please login first.");

      const response = await fetch(`${url.backendUrl}/api/delete-chat`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        ["auth_token", "user_email", "token_type"].forEach((k) =>
          localStorage.removeItem(k)
        );
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorMessage = await parseErrorMessage(response);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      const normalized: DeleteChatResponse = {
        success: data.success !== false,
        message: data.message || "Chat deleted successfully",
        chat_id: data.chat_id ?? payload.chat_id,
      };

      set({ loading: false });
      return normalized;
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },
}));
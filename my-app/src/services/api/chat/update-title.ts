/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { url } from "../api-url";

export interface updateTitleAPI {
  chat_id: string;
  title: string;
}

export interface UpdateTitleResponse {
  success: boolean;
  message: string;
  chat?: {
    chat_id: string;
    title: string;
    updated_at: string;
  };
}

interface UpdateTitleState {
  loading: boolean;
  error: string | null;
  updateTitle: (payload: updateTitleAPI) => Promise<UpdateTitleResponse>;
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

export const useUpdateTitleStore = create<UpdateTitleState>((set) => ({
  loading: false,
  error: null,

  updateTitle: async (payload: updateTitleAPI): Promise<UpdateTitleResponse> => {
    set({ loading: true, error: null });

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Authentication required. Please login first.");

      const response = await fetch(`${url.backendUrl}/api/update-title`, {
        method: "PUT",
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

      const normalized: UpdateTitleResponse = {
        success: data.success !== false,
        message: data.message || "Chat title updated successfully",
        chat: data.chat ?? { chat_id: payload.chat_id, title: payload.title, updated_at: new Date().toISOString() },
      };

      set({ loading: false });
      return normalized;
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },
}));
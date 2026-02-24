/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { url } from "../api-url";
import { useChatStore } from "../chat/chat-store"; // ADD THIS IMPORT

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  message: string;
  email: string;
  name: string;
}

interface LoginState {
  loading: boolean;
  error: string | null;
  token: string | null;
  email: string | null;
  name: string | null;

  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => void;
  hydrate: () => void;
  getAuthHeader: () => { Authorization: string } | null;
}

export const useLoginStore = create<LoginState>((set, get) => ({
  loading: false,
  error: null,
  token: null,
  email: null,
  name: null,

  hydrate: () => {
    if (typeof window === "undefined") return;

    set({
      token: localStorage.getItem("auth_token"),
      email: localStorage.getItem("user_email"),
      name: localStorage.getItem("user_name"),
    });
  },

  login: async (payload) => {
    try {
      set({ loading: true, error: null });

      const response = await fetch(`${url.backendUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      
      if (!response.ok) {
        const message =
          data?.detail ||
          data?.message ||
          "Login failed";

        if (message.includes("Please sign up to create an account")) {
          throw new Error("Please sign up to create an account.");
        }

        throw new Error(message);
      }

      // ✅ Success case
      const newEmail = data.email || payload.username;
      const lastLoginEmail = localStorage.getItem("lastLoginEmail");
      
      // NEW USER: Either no lastLoginEmail (first login ever) OR different email
      const isNewUser = !lastLoginEmail || lastLoginEmail !== newEmail;

      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_email", newEmail);
      localStorage.setItem("user_name", data.name);
      localStorage.setItem("currency", data.currency);
      localStorage.setItem("lastLoginEmail", newEmail); // Track current user

      set({
        loading: false,
        token: data.access_token,
        email: newEmail,
        name: data.name,
      });

      // ✅ Initialize chat store after successful login
      setTimeout(() => {
        if (isNewUser) {
          // Clear everything for new user
          useChatStore.getState().setSelectedFiles([]);
          useChatStore.getState().initializeOnLogin();
        } else {
          // For existing user, keep selectedFiles and restore from localStorage
          useChatStore.getState().initializeOnLogin();
        }
      }, 100);

      return data;

    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_email");
      localStorage.removeItem("token_type");
      localStorage.removeItem("lastLoginEmail"); // Clear tracking email
      
      // ✅ ADD THIS - Clean up chat store on logout
      useChatStore.getState().cleanupOnLogout();
    }

    set({ token: null, email: null, error: null });
  },

  getAuthHeader: () => {
    const token = get().token;
    return token ? { Authorization: `Bearer ${token}` } : null;
  },
}));
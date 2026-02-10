/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { url } from "../api-url";

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  message: string;
  email: string;
}

interface LoginState {
  loading: boolean;
  error: string | null;
  token: string | null;
  email: string | null;

  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => void;
  hydrate: () => void;
  getAuthHeader: () => { Authorization: string } | null;
}

export const useLoginStore = create<LoginState>((set, get) => ({
  loading: false,
  error: null,

  // ❌ do NOT touch localStorage here
  token: null,
  email: null,

  // ✅ Client-only hydration
  hydrate: () => {
    if (typeof window === "undefined") return;

    set({
      token: localStorage.getItem("auth_token"),
      email: localStorage.getItem("user_email"),
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

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data: LoginResponse = await response.json();

      // ✅ safe: this runs only after user action (client)
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_email", data.email || payload.username);

      set({
        loading: false,
        token: data.access_token,
        email: data.email || payload.username,
      });

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
    }

    set({ token: null, email: null, error: null });
  },

  getAuthHeader: () => {
    const token = get().token;
    return token ? { Authorization: `Bearer ${token}` } : null;
  },
}));

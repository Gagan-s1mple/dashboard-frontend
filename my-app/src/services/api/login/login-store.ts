/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { url } from "../api-url";

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginState {
  loading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<any>;
}

export const useLoginStore = create<LoginState>((set) => ({
  loading: false,
  error: null,

  login: async (payload) => {
    try {
      set({ loading: true, error: null });

      console.log("Login body :::", JSON.stringify(payload));

      const response = await fetch(`${url.backendUrl}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err || "Login failed");
      }

      // ✅ THIS WAS MISSING
      const data = await response.json();

      // ✅ store email for dashboard upload
      localStorage.setItem("user_email", data.email || payload.username);

      console.log("Login response :::", data);

      set({ loading: false });

      return data;
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },
}));

// src/services/api/forgot-password/forgot-password-store.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { url } from "../api-url";

interface ForgotPasswordState {
  loading: boolean;
  error: string | null;
  success: boolean;
  email: string | null;

  // Single action to request new password
  requestNewPassword: (email: string) => Promise<void>;
  resetState: () => void;
}

export const useForgotPasswordStore = create<ForgotPasswordState>((set) => ({
  loading: false,
  error: null,
  success: false,
  email: null,

  requestNewPassword: async (email: string) => {
    try {
      set({ loading: true, error: null, success: false });

      const response = await fetch(`${url.backendUrl}/api/forgotpassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if user is not registered
        if (data.message?.includes("User not registered")) {
          throw new Error("This email is not registered. Please sign up first.");
        }
        throw new Error(data.message || "Failed to send new credentials");
      }

      set({
        loading: false,
        success: true,
        email,
        error: null,
      });
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Failed to request new password",
        success: false,
      });
      throw err;
    }
  },

  resetState: () => {
    set({
      loading: false,
      error: null,
      success: false,
      email: null,
    });
  },
}));
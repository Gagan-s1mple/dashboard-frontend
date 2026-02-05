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
  getAuthHeader: () => { Authorization: string } | null;
}

export const useLoginStore = create<LoginState>((set, get) => ({
  loading: false,
  error: null,
  token: localStorage.getItem("auth_token") || null,
  email: localStorage.getItem("user_email") || null,

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

      const data: LoginResponse = await response.json();

      // ✅ Store token and email for authentication
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_email", data.email || payload.username);
      
    
    

      console.log("Login response :::", data);

      set({ 
        loading: false, 
        token: data.access_token,
        email: data.email || payload.username 
      });

      return data;
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  logout: () => {
    // Clear all auth-related localStorage items
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("token_type");
    
    set({ 
      token: null, 
      email: null,
      error: null 
    });
  },

  getAuthHeader: () => {
    const token = get().token || localStorage.getItem("auth_token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return null;
  }
}));
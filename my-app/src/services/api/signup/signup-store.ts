/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { url } from "../api-url";

interface SignupPayload {
  name: string;
  email: string;
  phno: string;
  occupation: string;
  organization: string;
}

interface SignupState {
  loading: boolean;
  error: string | null;
  signup: (payload: SignupPayload) => Promise<any>;
}

export const useSignupStore = create<SignupState>((set) => ({
  loading: false,
  error: null,

  signup: async (payload) => {
    try {
      set({ loading: true, error: null });


      const response = await fetch(`${url.backendUrl}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
  const errorData = await response.json();

  let message = "Signup failed";

  if (Array.isArray(errorData.detail)) {
    message = errorData.detail[0]?.msg;
  } else if (typeof errorData.detail === "string") {
    message = errorData.detail;
  }

  throw new Error(message);
}

      const data = await response.json();
   

      set({ loading: false });
      return data;
    } catch (err: any) {
      set({ loading: false, error: err.message });
      throw err;
    }
  },
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { url } from "../api-url";

interface UploadState {
  uploading: boolean;
  error: string | null;
  filenames: string[];
  uploadedEmail: string | null;
  uploadSuccess: boolean;

  uploadAndGenerate: (email: string, files: File[]) => Promise<void>;
  getUploadedEmail: () => string | null;
  clearUploads: () => void;
  setUploadSuccess: (success: boolean) => void;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const useUploadStore = create<UploadState>((set, get) => ({
  uploading: false,
  error: null,
  filenames: [],
  uploadedEmail: null,
  uploadSuccess: false,

  uploadAndGenerate: async (email, files) => {
    try {
      set({ uploading: true, error: null });

      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication required. Please login first.");
      }

      const form = new FormData();

      files.forEach((files) => {
        form.append("files", files); 
      });


      const response = await fetch(`${url.backendUrl}/api/upload-file`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_email");
          localStorage.removeItem("token_type");
          throw new Error("Session expired. Please login again.");
        }

        const errorText = await response.text();

        throw new Error(
          errorText ||
            `Upload failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      set({
        filenames: files.map((f) => f.name),
        uploadedEmail: email, 
        uploadSuccess: true,
      });

      set({ uploading: false });
      return data;
    } catch (err: any) {
    
      set({ uploading: false, error: err.message });
      throw err;
    }
  },

  getUploadedEmail: () => {
    return get().uploadedEmail;
  },

  clearUploads: () => {
    set({
      filenames: [],
      uploadedEmail: null,
      error: null,
      uploadSuccess: false,
    });
  },

  setUploadSuccess: (success: boolean) => {
    set({ uploadSuccess: success });
  },
}));
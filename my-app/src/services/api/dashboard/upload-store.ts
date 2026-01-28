/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { url } from "../api-url";
import { useDashboardStore } from "./dashboard-store";

interface UploadState {
  uploading: boolean;
  error: string | null;
  filenames: string[];

  uploadAndGenerate: (email: string, files: File[]) => Promise<void>;
}

export const useUploadStore = create<UploadState>((set) => ({
  uploading: false,
  error: null,
  filenames: [],

  uploadAndGenerate: async (email, files) => {
    try {
      set({ uploading: true, error: null });

      const form = new FormData();
      form.append("email", email);

      files.forEach((file) => {
        form.append("file", file); // backend expects "file"
      });

      const response = await fetch(`${url.backendUrl}/api/upload-csv`, {
        method: "POST",
        body: form,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();

      // save filenames locally for UI
      set({
        filenames: files.map((f) => f.name),
      });

      // store dashboard json
      useDashboardStore.getState().setDashboard(data);

      set({ uploading: false });
    } catch (err: any) {
      set({ uploading: false, error: err.message });
      throw err;
    }
  },
}));

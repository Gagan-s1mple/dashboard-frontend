
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { url } from "../api-url";

interface DeleteFileState {
  loading: boolean;
  error: string | null;
  deleteFile: (filename: string) => Promise<void>;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const useDeleteFileStore = create<DeleteFileState>((set) => ({
  loading: false,
  error: null,

  deleteFile: async (filename: string) => {
    try {
      set({ loading: true, error: null });

      const token = getAuthToken();
      
      // Check if user is authenticated
      if (!token) {
        throw new Error("Authentication required. Please login first.");
      }

      console.log("Deleting file:", { filename, hasToken: !!token });

      // IMPORTANT: Backend expects { "filenames": ["filename.csv"] } (array of strings)
      const requestBody = {
        filenames: [filename] // Wrap filename in an array
      };

      console.log("Delete request body:", requestBody);

      const response = await fetch(`${url.backendUrl}/api/delete-file`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_email");
          localStorage.removeItem("token_type");
          throw new Error("Session expired. Please login again.");
        }
        
        const errorText = await response.text();
        console.error("Delete failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        
        // Try to parse the error response
        let errorMessage = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.detail && Array.isArray(errorJson.detail)) {
            errorMessage = errorJson.detail.map((err: any) => err.msg).join(", ");
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch (error) {
            console.log("Error deleting the file.Please Try again",error)
          // If parsing fails, use the raw error text
        }
        
        throw new Error(
          errorMessage ||
            `Delete failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("Delete response:", data);

      set({ loading: false });
      return data;
    } catch (err: any) {
      console.error("Delete error:", err);
      set({ loading: false, error: err.message });
      throw err;
    }
  },
}));

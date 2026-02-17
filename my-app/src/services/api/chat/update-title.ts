import { url } from "../api-url";

export interface UpdateTitlePayload {
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

class UpdateTitleAPI {
  private baseUrl: string;

  constructor(baseUrl: string = `${url.backendUrl}`) {
    this.baseUrl = baseUrl;
  }

  /**
   * Update chat title
   * PUT /api/update-title
   */
  async updateTitle(payload: UpdateTitlePayload): Promise<UpdateTitleResponse> {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      console.log("📤 Updating chat title:", payload);

      const response = await fetch(`${this.baseUrl}/api/update-title`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Check if response is OK
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Title update response:", data);
      
      // Even if we get 200, check if the response indicates success
      // The backend might return success: false even with 200 status
      if (data.success === false) {
        throw new Error(data.message || "Failed to update title on server");
      }
      
      return data;
    } catch (error) {
      console.error("❌ Failed to update chat title:", error);
      throw error;
    }
  }
}

export const updateTitleAPI = new UpdateTitleAPI();
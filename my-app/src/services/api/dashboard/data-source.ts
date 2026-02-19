import { url } from "../api-url";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export async function fetchDataSources() {
  try {
    const token = getAuthToken();

    // Check if user is authenticated
    if (!token) {
      console.warn("No authentication token found. User may need to login.");
      return [];
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(`${url.backendUrl}/api/list-files`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        console.warn("Authentication failed, clearing tokens...");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_email");
        localStorage.removeItem("token_type");
        return []; // Return empty array, don't throw
      }

      // For any other error, return empty array
      console.error(`Failed to fetch data sources: ${response.status}`);
      return [];
    }

    const data = await response.json();

    // Handle different response structures
    if (data.files && Array.isArray(data.files)) {
      return data.files;
    } else if (data.dataSources && Array.isArray(data.dataSources)) {
      return data.dataSources;
    } else if (Array.isArray(data)) {
      return data;
    }

    // If response doesn't match expected format, return empty array
    return [];
  } catch (error) {
    console.error("Error in fetchDataSources:", error);
    return []; // Always return empty array on error
  }
}

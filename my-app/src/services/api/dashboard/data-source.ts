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
      "Authorization": `Bearer ${token}`,
    };

    console.log("Fetching data sources with token:", {
      hasToken: !!token,
      url: `${url.backendUrl}/api/list-files`,
    });

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
        throw new Error("Session expired. Please login again.");
      }
      
      const errorText = await response.text();
      console.error("Failed to fetch data sources:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Failed to fetch data sources: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Data sources fetched:", data);
    
    // Handle different response structures
    if (data.files && Array.isArray(data.files)) {
      console.log("Using 'files' array from response:", data.files.length);
      return data.files; // This returns array of strings
    } else if (data.dataSources && Array.isArray(data.dataSources)) {
      console.log("Using 'dataSources' array from response:", data.dataSources.length);
      return data.dataSources;
    } else if (Array.isArray(data)) {
      console.log("Response is directly an array:", data.length);
      return data;
    }
    
    console.warn("Unexpected response structure, returning empty array:", data);
    return [];
  } catch (error) {
    console.error("Error in fetchDataSources:", error);
    throw error;
  }
}
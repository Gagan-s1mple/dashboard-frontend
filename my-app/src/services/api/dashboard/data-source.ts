/* eslint-disable @typescript-eslint/no-unused-vars */
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
 
      throw new Error(`Failed to fetch data sources: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
   
    
    // Handle different response structures
    if (data.files && Array.isArray(data.files)) {

      return data.files; // This returns array of strings
    } else if (data.dataSources && Array.isArray(data.dataSources)) {
      return data.dataSources;
    } else if (Array.isArray(data)) {

      return data;
    }

    return [];
  } catch (error) {

    throw error;
  }
}
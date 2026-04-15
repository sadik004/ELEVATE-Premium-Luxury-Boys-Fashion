// Ensure NEXT_PUBLIC_API_URL is used in production, otherwise fallback to localhost
let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_API_URL) {
  console.error("FATAL ERROR: NEXT_PUBLIC_API_URL is not set in production.");
}

// Normalize the base URL to avoid trailing slashes and ensure it ends with /api
const normalizedApiUrl = rawApiUrl.replace(/\/+$/, "");
const API_URL = normalizedApiUrl.endsWith("/api") ? normalizedApiUrl : `${normalizedApiUrl}/api`;

class ApiClient {
  async request(endpoint, options = {}) {
    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${normalizedEndpoint}`;

    console.log("🚀 API Fetching URL:", url);

    // Get token from localStorage if in browser
    let token = null;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("auth-storage")
        ? JSON.parse(localStorage.getItem("auth-storage"))?.state?.token
        : null;
    }

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error(`Failed to parse JSON response. Status: ${response.status}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `API request failed with status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ API Fetch Error for ${url}:`, error.message);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }
}

export const api = new ApiClient();

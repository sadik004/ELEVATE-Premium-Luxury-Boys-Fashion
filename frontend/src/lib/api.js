// Ensure NEXT_PUBLIC_API_URL is used in production, otherwise fallback to localhost
let rawApiUrl =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");

if (process.env.NODE_ENV === "production" && !rawApiUrl) {
  console.error("FATAL ERROR: NEXT_PUBLIC_API_URL is not set in production. Falling back to empty string to prevent build crash.");
  rawApiUrl = ""; // Fallback to avoid crashes, though it should be set
}

// Normalize the base URL to consistently remove trailing slashes
export const BASE_URL = rawApiUrl ? rawApiUrl.replace(/\/+$/, "") : "";
// API_URL strictly appends /api to the base URL
const API_URL = BASE_URL ? `${BASE_URL}/api` : "/api";

class ApiClient {
  async request(endpoint, options = {}) {
    // Ensure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${normalizedEndpoint}`;

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

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
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

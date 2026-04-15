// Ensure NEXT_PUBLIC_API_URL is used in production, otherwise fallback to localhost
const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api");

if (process.env.NODE_ENV === "production" && !API_URL) {
  console.error("FATAL ERROR: NEXT_PUBLIC_API_URL is not set in production.");
}

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;

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

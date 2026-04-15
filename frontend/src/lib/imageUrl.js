export function getImageUrl(imagePath) {
  if (!imagePath) return "/images/placeholder.jpg"; // fallback

  let baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_API_URL
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  if (!baseUrl) {
    baseUrl = "http://localhost:5000/api";
  }

  try {
    // Attempt to parse as a URL to extract the origin
    const url = new URL(baseUrl);
    const origin = url.origin; // e.g., "http://localhost:5000" or "https://your-backend.onrender.com"
    return `${origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  } catch (e) {
    console.error("Failed to parse API URL to construct image URL:", baseUrl);
    return imagePath;
  }
}

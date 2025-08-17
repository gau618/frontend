// Centralized API base URL and fetch helper
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  const headers = new Headers(options.headers || {});
  const body = options.body;

  // If body is a plain object, serialize as JSON
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  if (!isFormData && body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
    body:
      isFormData || !body
        ? body
        : typeof body === "string"
        ? body
        : JSON.stringify(body),
  });

  return res;
}

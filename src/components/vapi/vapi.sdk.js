import Vapi from "@vapi-ai/web";

// Vite exposes variables prefixed with VITE_
export const VAPI_WEB_TOKEN = import.meta.env.VITE_VAPI_WEB_TOKEN;

if (!VAPI_WEB_TOKEN) {
  console.warn(
    "VITE_VAPI_WEB_TOKEN is not set. Please add it to frontend/.env and restart the dev server."
  );
}

export const vapi = new Vapi(VAPI_WEB_TOKEN);

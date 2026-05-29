const rawApiBase =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  import.meta.env.VITE_API_BASE?.trim() ||
  "";

export const API_BASE_URL = rawApiBase.replace(/\/+$/, "");
export const hasApiBaseUrl = API_BASE_URL.length > 0;

export const FRONTEND_RUNTIME = {
  apiBaseUrl: API_BASE_URL,
  // Keep backward compatibility while steering all docs to VITE_API_BASE_URL.
  usesLegacyApiEnv: !import.meta.env.VITE_API_BASE_URL && !!import.meta.env.VITE_API_BASE,
} as const;

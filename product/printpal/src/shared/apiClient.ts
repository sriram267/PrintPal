declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
      user?: {
        id: string;
        primaryEmailAddress?: { emailAddress: string };
        fullName?: string;
      };
    };
  }
}

type TokenGetter = () => Promise<string | null>;

let activeTokenGetter: TokenGetter | null = null;

/**
 * Register a custom token getter (e.g. from Clerk useAuth hook).
 */
export function registerAuthTokenGetter(getter: TokenGetter) {
  activeTokenGetter = getter;
}

/**
 * Retrieve the active Clerk session JWT.
 */
export async function getAuthToken(): Promise<string | null> {
  if (activeTokenGetter) {
    try {
      const token = await activeTokenGetter();
      if (token) return token;
    } catch (err) {
      console.warn("[apiClient] Token getter error:", err);
    }
  }

  // Fallback to global window.Clerk session instance
  if (typeof window !== "undefined") {
    const clerk = (window as any).Clerk;
    if (clerk?.session?.getToken) {
      try {
        const token = await clerk.session.getToken();
        if (token) return token;
      } catch (err) {
        console.warn("[apiClient] window.Clerk.session.getToken error:", err);
      }
    }
    if (clerk?.client?.activeSessions?.[0]?.getToken) {
      try {
        const token = await clerk.client.activeSessions[0].getToken();
        if (token) return token;
      } catch {}
    }
  }

  return null;
}

/**
 * Authenticated Fetch Wrapper for PrintPal API.
 * Automatically attaches Authorization: Bearer <token> to every request.
 */
export async function apiClient(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const apiBase = (import.meta as any).env?.VITE_API_URL || "/api";
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${apiBase}${normalizedEndpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    console.warn(`[apiClient] 401 Unauthorized for ${url}. Session may have expired.`);
  }

  return res;
}

/**
 * Installs a global fetch interceptor that automatically attaches
 * Authorization: Bearer <token> to all protected /api/* calls.
 */
let isInterceptorInstalled = false;

export function installAuthFetchInterceptor() {
  if (isInterceptorInstalled || typeof window === "undefined") return;
  isInterceptorInstalled = true;

  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init: RequestInit = {}) {
    const urlString =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : input.url;

    // Intercept protected API routes
    if (
      (urlString.startsWith("/api/") || urlString.includes("/api/")) &&
      !urlString.includes("/api/health")
    ) {
      const token = await getAuthToken();
      if (token) {
        const headers = new Headers(init.headers || {});
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        init = { ...init, headers };
      }
    }

    return originalFetch.call(this, input, init);
  };
}

const DEFAULT_API_PORT = "8000";

const trimTrailingSlash = (value: string): string => value.replace(/\/$/, "");

let hasLoggedApiBaseInDev = false;

const logApiBaseUrlDevOnly = (resolvedApiBase: string, configured?: string): void => {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") {
    return;
  }

  if (hasLoggedApiBaseInDev) {
    return;
  }

  hasLoggedApiBaseInDev = true;
  console.info("[apiBaseUrl]", {
    resolvedApiBase,
    configured: configured ?? null,
    windowOrigin: window.location.origin,
    hostname: window.location.hostname,
  });
};

export const getApiBaseUrl = (): string => {
  const configured = process.env.REACT_APP_API_URL?.trim();

  if (!configured) {
    if (typeof window !== "undefined") {
      const clientHost = window.location.hostname;
      const clientIsLocalhost =
        clientHost === "localhost" || clientHost === "127.0.0.1";

      if (clientIsLocalhost) {
        const localApiBase = `${window.location.protocol}//${clientHost}:${DEFAULT_API_PORT}/api`;
        logApiBaseUrlDevOnly(localApiBase);
        return localApiBase;
      }

      // In deployed environments frontend nginx proxies /api to backend.
      const proxiedApiBase = `${window.location.origin}/api`;
      logApiBaseUrlDevOnly(proxiedApiBase);
      return proxiedApiBase;
    }

    return `http://localhost:${DEFAULT_API_PORT}/api`;
  }

  try {
    const url = new URL(configured);
    const isLocalhostConfig =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";

    if (typeof window !== "undefined" && isLocalhostConfig) {
      const clientHost = window.location.hostname;
      const clientIsLocalhost =
        clientHost === "localhost" || clientHost === "127.0.0.1";

      if (!clientIsLocalhost) {
        const proxiedApiBase = `${window.location.origin}/api`;
        logApiBaseUrlDevOnly(proxiedApiBase, configured);
        return proxiedApiBase;
      }
    }

    const resolvedApiBase = trimTrailingSlash(configured);
    logApiBaseUrlDevOnly(resolvedApiBase, configured);
    return resolvedApiBase;
  } catch {
    // Supports relative values such as "/api".
    const resolvedApiBase = trimTrailingSlash(configured);
    logApiBaseUrlDevOnly(resolvedApiBase, configured);
    return resolvedApiBase;
  }
};

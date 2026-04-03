const DEFAULT_API_PORT = "8000";

export const getApiBaseUrl = (): string => {
  const configured = process.env.REACT_APP_API_URL?.trim();

  if (!configured) {
    if (typeof window !== "undefined") {
      return `${window.location.protocol}//${window.location.hostname}:${DEFAULT_API_PORT}/api`;
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
        return `${window.location.origin}/api`;
      }
    }

    return configured.replace(/\/$/, "");
  } catch {
    return configured.replace(/\/$/, "");
  }
};

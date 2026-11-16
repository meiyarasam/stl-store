export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * Safely executes a fetch request and parses JSON responses.
 * Gracefully handles non-JSON error pages, Vercel 413 Request Entity Too Large,
 * 502/504 gateway errors, and server-side exceptions without throwing syntax errors.
 */
export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get("content-type") || "";
    const status = res.status;

    // Handle standard Vercel / Gateway HTTP error codes before parsing
    if (status === 413) {
      return {
        success: false,
        status: 413,
        message: "Request Entity Too Large",
        error:
          "The file or request payload exceeds server limits (413 Request Entity Too Large). Large files must use direct signed storage upload.",
      };
    }

    if (status === 504) {
      return {
        success: false,
        status: 504,
        message: "Gateway Timeout",
        error: "The request timed out on the server (504 Gateway Timeout). Please try again.",
      };
    }

    if (status === 502 || status === 503) {
      return {
        success: false,
        status,
        message: "Service Unavailable",
        error: `Server is temporarily unavailable (HTTP ${status}). Please retry in a few moments.`,
      };
    }

    // If server responded with JSON, parse safely
    if (contentType.includes("application/json")) {
      try {
        const json = await res.json();
        return {
          success: json.success ?? res.ok,
          message: json.message || (res.ok ? "Operation succeeded" : "Operation failed"),
          data: json.data !== undefined ? json.data : json,
          error: json.error || (res.ok ? undefined : json.message || `Request failed with HTTP ${status}`),
          status,
        };
      } catch (parseErr: any) {
        return {
          success: false,
          status,
          message: "JSON Parse Error",
          error: "Failed to parse JSON response from server.",
        };
      }
    }

    // If server responded with plain text or HTML error
    const rawText = await res.text();
    const cleanText = rawText.replace(/<[^>]*>?/gm, "").trim().slice(0, 200);

    return {
      success: res.ok,
      status,
      message: res.ok ? "OK" : `HTTP ${status}`,
      error: res.ok
        ? undefined
        : cleanText || `Request failed with HTTP status ${status}.`,
    };
  } catch (netErr: any) {
    const isAbort = netErr.name === "AbortError";
    return {
      success: false,
      status: 0,
      message: isAbort ? "Request Aborted" : "Network Error",
      error: isAbort
        ? "The request was aborted or timed out. Please check your network connection."
        : netErr.message || "A network error occurred while connecting to the server.",
    };
  }
}

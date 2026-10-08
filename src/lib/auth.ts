export interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: any;
}

/**
 * Decodes a JWT token payload without external libraries.
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
}

/**
 * Checks if a JWT token is expired.
 * Returns true if expired or invalid, false if still valid.
 */
export function isTokenExpired(token?: string | null): boolean {
  if (!token) return true;
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) {
    // If no exp field, we cannot determine expiry from JWT structure alone
    return false;
  }
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Clears user auth state and tokens from localStorage.
 */
export function clearAuthSession(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
  localStorage.removeItem("profile");
}

export interface UserAuthData {
  token: string | null;
  name: string | null;
  email: string | null;
  profile: string | null;
  isAuthenticated: boolean;
}

/**
 * Retrieves and validates the current user auth state.
 * If the token is expired, it automatically clears the session and logs the user out.
 */
export function getValidAuthSession(): UserAuthData {
  const token = localStorage.getItem("token");
  if (!token) {
    return {
      token: null,
      name: null,
      email: null,
      profile: null,
      isAuthenticated: false,
    };
  }

  if (isTokenExpired(token)) {
    clearAuthSession();
    return {
      token: null,
      name: null,
      email: null,
      profile: null,
      isAuthenticated: false,
    };
  }

  const decoded = decodeJwt(token);

  const name =
    localStorage.getItem("name") ||
    decoded?.name ||
    null;

  const email =
    localStorage.getItem("email") ||
    decoded?.email ||
    null;

  const profile =
    localStorage.getItem("profile") ||
    decoded?.picture ||
    decoded?.profile ||
    decoded?.avatar ||
    null;

  return {
    token,
    name,
    email,
    profile,
    isAuthenticated: true,
  };
}

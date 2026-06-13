import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getCurrentUser, loginUser, registerUser } from "../api/authApi";

const TOKEN_KEY = "packpal_access_token";
const AuthContext = createContext(null);

function getFriendlyError(error) {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    if (detail.toLowerCase().includes("invalid email or password")) {
      return "Invalid credentials";
    }
    if (detail.toLowerCase().includes("email already registered")) {
      return "Email already exists";
    }
    if (detail.toLowerCase().includes("token")) {
      return "Session expired, please login again";
    }
    return detail;
  }

  return "Something went wrong";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      clearSession();
      return null;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setToken(storedToken);
      setError("");
      return currentUser;
    } catch (fetchError) {
      clearSession();
      setError("Session expired, please login again");
      return null;
    }
  }, [clearSession]);

  useEffect(() => {
    async function loadUser() {
      setIsLoading(true);
      await fetchCurrentUser();
      setIsLoading(false);
    }

    loadUser();
  }, [fetchCurrentUser]);

  const login = useCallback(async (payload) => {
    setIsLoading(true);
    setError("");
    try {
      const tokenResponse = await loginUser(payload);
      localStorage.setItem(TOKEN_KEY, tokenResponse.access_token);
      setToken(tokenResponse.access_token);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (loginError) {
      clearSession();
      const message = getFriendlyError(loginError);
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [clearSession]);

  const register = useCallback(async (payload) => {
    setIsLoading(true);
    setError("");
    try {
      await registerUser(payload);
      return await login({ email: payload.email, password: payload.password });
    } catch (registerError) {
      const message = registerError?.response
        ? getFriendlyError(registerError)
        : registerError.message || "Something went wrong";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const logout = useCallback(() => {
    clearSession();
    setError("");
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      error,
      register,
      login,
      logout,
      fetchCurrentUser,
    }),
    [error, fetchCurrentUser, isLoading, login, logout, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

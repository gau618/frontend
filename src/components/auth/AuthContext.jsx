import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "../constants/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Hydrate user on load
  const refreshUser = async () => {
    try {
      const res = await apiFetch("/api/v1/user/currentUser");
      if (res.ok) {
        const data = await res.json();
        setUser(data?.data || null);
      }
    } catch {}
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/api/v1/user/currentUser");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setUser(data?.data || null);
        } else if (!cancelled) {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async ({ email, username, password }) => {
    const payload = { password };
    if (email) payload.email = email.trim().toLowerCase();
    if (username) payload.username = username.trim().toLowerCase();
    const res = await apiFetch("/api/v1/user/login", {
      method: "POST",
      body: payload,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.message || "Login failed");
    setUser(body?.data?.loggedInUser || null);
    return body;
  };

  const register = async (formData, { autoLogin = true } = {}) => {
    const res = await apiFetch("/api/v1/user/register", {
      method: "POST",
      body: formData,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body?.message || "Registration failed");
    // Optionally, auto-login with provided credentials
    if (autoLogin) {
      const email = formData.get("email");
      const username = formData.get("username");
      const password = formData.get("password");
      try {
        await login({ email, username, password });
      } catch {}
    }
    return body;
  };

  const logout = async () => {
    try {
      await apiFetch("/api/v1/user/logout", { method: "POST" });
    } finally {
      setUser(null);
      navigate("/auth");
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, register, refreshUser }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

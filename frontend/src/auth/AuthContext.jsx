import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const stored = localStorage.getItem("hrms_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await authApi.login(username, password);
    localStorage.setItem("hrms_access_token", data.accessToken);
    localStorage.setItem("hrms_refresh_token", data.refreshToken);
    localStorage.setItem("hrms_user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("hrms_access_token");
    localStorage.removeItem("hrms_refresh_token");
    localStorage.removeItem("hrms_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

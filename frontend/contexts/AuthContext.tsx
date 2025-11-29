"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
  user_id: number;
  name?: string;
  exp: number;
  authorized: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userName?: string;
  userId: number | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  // ⚡ Declara todos os estados primeiro
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("token");
    if (!token) return false;

    const decoded = jwtDecode<DecodedToken>(token);
    const now = Date.now() / 1000;
    return decoded.exp > now;
  });

  const [userName, setUserName] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    const token = localStorage.getItem("token");
    if (!token) return undefined;
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.name;
  });

  const [userId, setUserId] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.user_id;
  });

  // ⚡ Agora sim, declare as funções que usam os estados
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserName(undefined);
    setUserId(null);
    router.push("/login");
  }, [router]);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode<DecodedToken>(token);

    setIsLoggedIn(true);
    setUserName(decoded.name);
    setUserId(decoded.user_id);
  };

  // Verifica token expirado periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const decoded = jwtDecode<DecodedToken>(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        logout();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};

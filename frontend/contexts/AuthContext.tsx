"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
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
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      console.log("Token on init:", token);
      return !!token;
    }
    return false;
  });

  const [userName, setUserName] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode<DecodedToken>(token);
        console.log("Decoded token on init:", decoded);
        return decoded.name;
      }
    }
    return undefined;
  });

  const login = (token: string) => {
    console.log("Login called with token:", token);
    localStorage.setItem("token", token);
    setIsLoggedIn(true);

    const decoded = jwtDecode<DecodedToken>(token);
    console.log("Decoded token on login:", decoded);
    setUserName(decoded.name);
  };

  const logout = () => {
    console.log("Logout called");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserName(undefined);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};

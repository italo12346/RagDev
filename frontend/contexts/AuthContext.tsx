"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  user_id: number;
  name?: string;
  exp: number;
  authorized: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userName?: string;
  userId: number | null;   // 👈 ADICIONADO
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();

  // Estado de login
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("token");
    }
    return false;
  });

  // Estado do nome (opcional)
  const [userName, setUserName] = useState<string | undefined>(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode<DecodedToken>(token);
        return decoded.name;
      }
    }
    return undefined;
  });

  // 👇 NOVO: Estado do userId
  const [userId, setUserId] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode<DecodedToken>(token);
        return decoded.user_id;
      }
    }
    return null;
  });

  // Função de login
  const login = (token: string) => {
    localStorage.setItem("token", token);

    const decoded = jwtDecode<DecodedToken>(token);

    setIsLoggedIn(true);
    setUserName(decoded.name);
    setUserId(decoded.user_id); // 👈 SALVA o userId
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserName(undefined);
    setUserId(null);  // 👈 limpa userId
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userName,
        userId,   
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return context;
};

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useProtectedRoute() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se não estiver logado, redireciona
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn, router]);
}

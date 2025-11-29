"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getUserProfile } from "@/services/api/profile";

export default function Navbar() {
  const { isLoggedIn, userId, logout } = useAuth();
  const [name, setName] = useState<string | null>(null);

  // Buscar nome do usuário quando logado
  useEffect(() => {
    if (!userId || !isLoggedIn) return;

    const fetchName = async () => {
      try {
        const data = await getUserProfile(userId);
        setName(data.name);
      } catch (err) {
        console.error("Erro ao carregar nome:", err);
      }
    };

    fetchName();
  }, [userId, isLoggedIn]);

  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-background text-foreground">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">
          RagDev
        </Link>

        <div className="flex gap-4 items-center">


          {isLoggedIn ? (
            <>
              {/* Nome vindo do backend */}
              <Link href="/profile" className="hover:underline">
                {name}
              </Link>

              <button
                onClick={logout}
                className="hover:underline bg-transparent border-none cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:underline">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { isLoggedIn, userName, logout } = useAuth();
  const [hasMounted, setHasMounted] = useState(false);

  // Evita hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-background text-foreground">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">
          RagDev
        </Link>

        <div className="flex gap-4 items-center">
          {/* Mostrar Posts apenas se estiver logado */}
          {isLoggedIn && (
            <Link href="/posts" className="hover:underline">
              Posts
            </Link>
          )}

          {isLoggedIn ? (
            <>
              {/* Nome do usuário */}
              {userName && <span className="font-medium">{userName}</span>}

              {/* Botão Logout */}
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

"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef, useCallback } from "react";
import { getUserProfile } from "@/services/api/profile";
import { searchUsers } from "@/services/api/search";
import { useRouter } from "next/navigation";

function UserSearch({
  search,
  setSearch,
  results,
  setResults,
}: {
  search: string;
  setSearch: (value: string) => void;
  results: { id: number; name: string; nick: string }[];
  setResults: (value: { id: number; name: string; nick: string }[]) => void;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Busca com debounce
  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchUsers(search.trim());
        setResults(data);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [search, setResults]);

  // Fechar dropdown ao clicar fora
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setResults([]);
      }
    },
    [setResults]
  );

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [handleClickOutside]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        placeholder="Buscar usuários..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 outline-none"
      />

      {results.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {results.map((user) => (
            <li
              key={user.id}
              role="option"
              className="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => {
                router.push(`/profile/${user.id}`);
                setSearch("");
                setResults([]);
              }}
            >
              {user.name} @{user.nick}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Navbar() {
  const { isLoggedIn, userId, logout } = useAuth();
  const [name, setName] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ id: number; name: string; nick: string }[]>([]);
    const isClient = useRef(false);
  useEffect(() => {
    isClient.current = true;
  }, []);

  // Buscar nome do usuário logado
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
  // eslint-disable-next-line react-hooks/refs
  if (!isClient.current) return null;
  return (
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 bg-background text-foreground">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-4 gap-8">
        <Link href="/" className="text-xl font-bold">
          RagDev
        </Link>

        <div className="flex gap-4 items-center relative flex-1">
          {isLoggedIn && (
            <UserSearch
              search={search}
              setSearch={setSearch}
              results={results}
              setResults={setResults}
            />
          )}

          {isLoggedIn ? (
            <>
              {name && (
                <Link href="/profile" className="hover:underline">
                  {name}
                </Link>
              )}
              <button
                onClick={logout}
                className="hover:underline bg-transparent border-none cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex align-right gap-4">
              <Link href="/login" className="hover:underline">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

"use client";
import { useProtectedRoute } from "@/hooks/useProtectRoute";

export default function Posts() {
  useProtectedRoute(); // garante que apenas usuários logados acessam

  return (
    <div>
      <h1 className="text-2xl font-bold">Postagens</h1>
      <p>Bem-vindo à área restrita!</p>
    </div>
  );
}

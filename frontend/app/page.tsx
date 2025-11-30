"use client";
import { useProtectedRoute } from "@/hooks/useProtectRoute";
import Posts from "@/components/Post";

export default function HomePage() {
  useProtectedRoute();
  return (
    <div className="">
      <div className="justify-center text-center max-w-2xl mx-auto mt-10 mb-6 px-4">
      <h1 className="text-2xl font-semibold mb-4">Bem-vindo ao RagDev</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Aqui você pode criar posts e interagir com likes.
      </p>
      </div>

      {/* Exibe os posts do usuário logado */}
      <Posts />
    </div>
  );
}

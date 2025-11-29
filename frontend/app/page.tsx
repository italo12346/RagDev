"use client"
import { useProtectedRoute } from "@/hooks/useProtectRoute";

export default function HomePage() {
  useProtectedRoute();
  return (
    <div className="">
      <h1 className="text-2xl font-semibold mb-4">Bem-vindo ao RagDev</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Aqui você pode criar posts e interagir com likes.
      </p>
    </div>
  );
}

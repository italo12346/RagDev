"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login as loginAPI } from "@/services/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { ERROR_MESSAGES } from "@/services/api/erros";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(); // função do AuthContext

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Chama a API e retorna token
      const token = await loginAPI(form.email, form.password);

      // Atualiza o AuthContext
      login(token);

      // Redireciona
      router.push("/posts");
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || ERROR_MESSAGES.LOGIN_FAILED;
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Entrar</h1>

        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              required
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Senha</label>
            <input
              type="password"
              required
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:bg-blue-400"
          >
            {loading ? "Entrando..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 text-sm opacity-80">
          Ainda não tem conta?{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            Criar conta
          </a>
        </p>
      </div>
    </div>
  );
}

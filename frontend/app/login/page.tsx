"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/api/auth";
import { ERROR_MESSAGES } from "@/services/api/erros";
import React, { startTransition } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Função genérica para inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getErrorMessage = (errorKey: string) => {
    const map: Record<string, string> = {
      INVALID_CREDENTIALS: ERROR_MESSAGES.INVALID_CREDENTIALS,
      SERVER_ERROR: ERROR_MESSAGES.SERVER_ERROR,
      LOGIN_FAILED: ERROR_MESSAGES.LOGIN_FAILED,
    };
    return map[errorKey] || ERROR_MESSAGES.LOGIN_FAILED;
  };

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    await login(form.email, form.password);

    
await login(form.email, form.password);
router.replace("/"); 

  } catch (err) {
    if (err instanceof Error) setError(getErrorMessage(err.message));
    else setError(ERROR_MESSAGES.LOGIN_FAILED);
  } finally {
    setLoading(false);
  }
}

  return (
    <div className=" flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Entrar</h1>

        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              disabled={loading}
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              disabled={loading}
              className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 outline-none"
              value={form.password}
              onChange={handleChange}
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

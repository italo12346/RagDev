"use client";

import { useState } from "react";
import { registerUser } from "@/services/api/register";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";

interface AxiosErrorResponse {
  error?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [nick, setNick] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await registerUser({ name, nick, email, password });

      // Mostra mensagem de sucesso
      setSuccess("Conta criada com sucesso! Redirecionando...");

      // Aguarda 1.5 segundos antes do redirect
      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (err: unknown) {

      const axiosError = err as AxiosError<AxiosErrorResponse>;

      setError(
        axiosError.response?.data?.error ||
        "Erro ao criar conta"
      );
    }
  };

  return (
    <div className="flex justify-center items-center dark:bg-gray-900 px-4">

      <div className="w-full max-w-xl bg-white dark:bg-gray-850 rounded-2xl p-10 border border-gray-200 dark:border-gray-700 shadow-sm">

        <h1 className="text-center text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-8">
          Criar sua conta
        </h1>

        {/* Erro */}
        {error && (
          <p className="mb-4 p-3 text-center text-sm text-red-600 bg-red-100 border border-red-200 rounded-lg">
            {error}
          </p>
        )}

        {/* Sucesso */}
        {success && (
          <p className="mb-4 p-3 text-center text-sm text-green-600 bg-green-100 border border-green-200 rounded-lg">
            {success}
          </p>
        )}

        <form onSubmit={handleRegister} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300">Nome</label>
              <input
                className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                           rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300">Nick</label>
              <input
                className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                           rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                         rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 dark:text-gray-300">Senha</label>
            <input
              type="password"
              className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                         rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3 pt-2">

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium 
                         transition shadow-sm"
            >
              Registrar
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700
                         dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 
                         dark:hover:bg-gray-700 transition"
            >
              Já tenho uma conta
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

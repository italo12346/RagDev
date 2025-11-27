"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getUserProfile } from "@/services/api/profile";

interface DecodedToken {
  user_id: number;
  exp: number;
  authorized: boolean;
}

interface UserProfile {
  id: number;
  name: string;
  email: string;
  nick: string;
  createdAt: string; // <-- corrigido
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserProfile | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode<DecodedToken>(token);
    console.log("🔍 Token decodificado:", decoded);

    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(decoded.user_id);

        console.log("📌 Dados completos do usuário:", data);

        setUserData(data);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      }
    };

    fetchProfile();
  }, []);

  if (!userData) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold">Carregando perfil...</h2>
      </div>
    );
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      
      <div className="flex justify-center mb-4">
        <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-md">
          {getInitials(userData.name)}
        </div>
      </div>

      <h1 className="text-2xl font-bold text-center mb-1">{userData.name}</h1>

      <p className="text-center text-gray-500">@{userData.nick}</p>

      <div className="mt-6 space-y-2 text-gray-700 dark:text-gray-300">
        <p><strong>Email:</strong> {userData.email}</p>

        <p>
          <strong>Criado em:</strong>{" "}
          {new Date(userData.createdAt).toLocaleDateString("pt-BR")}
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition">
          Editar Perfil
        </button>
      </div>

      <pre className="mt-6 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm overflow-auto">
        {JSON.stringify(userData, null, 2)}
      </pre>
    </div>
  );
}

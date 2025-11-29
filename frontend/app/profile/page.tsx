"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getUserProfile, updateUserProfile } from "@/services/api/profile";
import Modal from "@/components/Modal";
import { changePassword } from "@/services/api/changePassword";
import { useProtectedRoute } from "@/hooks/useProtectRoute";


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
  createdAt: string;
}

export default function ProfilePage() {
  useProtectedRoute();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editNick, setEditNick] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode<DecodedToken>(token);

    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(decoded.user_id);
        setUserData(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  const openEditModal = () => {
    if (!userData) return;

    setEditName(userData.name);
    setEditNick(userData.nick);
    setEditEmail(userData.email); // <-- ADICIONADO
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!userData) return;

    const payload = {
      name: editName,
      nick: editNick,
      email: editEmail, // <-- ADICIONADO
    };

    try {
      const updated = await updateUserProfile(userData.id, payload);
      setUserData(updated);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
    }
  };

  const handlePasswordUpdate = async () => {
  if (!userData) return;

  try {
    await changePassword(userData.id, {
      OldPassword: currentPassword,
      NewPassword: newPassword,
    });

    alert("Senha atualizada com sucesso!");
    setIsPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
  } catch (err: unknown) {

    let errorMessage = "Erro ao atualizar senha";

    if (err && typeof err === "object" && "response" in err) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      errorMessage = axiosErr.response?.data?.error || errorMessage;
    }

    alert(errorMessage);
  }
};
  if (!userData) return <p>Carregando...</p>;

  return (
    <>
      {/* CARD */}
      <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-md">
            {userData.name.split(" ").map(n => n[0]).join("").toUpperCase()}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-1">{userData.name}</h1>

        <p className="text-center text-gray-500">@{userData.nick}</p>

        <div className="mt-6 text-gray-700 dark:text-gray-300 space-y-2">
          <p><strong>Email:</strong> {userData.email}</p>
          <p>
            <strong>Criado em:</strong>{" "}
            {new Date(userData.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={openEditModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition"
          >
            Editar Perfil
          </button>
        </div>
      </div>

      {/* MODAL EDITAR PERFIL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>

        <div className="space-y-4">

          {/* Nome */}
          <div>
            <label className="font-medium">Nome</label>
            <input
              className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>

          {/* Nick */}
          <div>
            <label className="font-medium">Nick</label>
            <input
              className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              value={editNick}
              onChange={(e) => setEditNick(e.target.value)}
            />
          </div>

          {/* Email EDITÁVEL */}
          <div>
            <label className="font-medium">Email</label>
            <input
              className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
          </div>

          {/* Senha */}
          <div>
            <label className="font-medium">Senha</label>

            <div className="flex gap-2">
              <input
                className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500"
                value="********"
                disabled
              />

              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg mt-1"
              >
                Alterar
              </button>
            </div>
          </div>

        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 border rounded-lg"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Salvar
          </button>
        </div>
      </Modal>

      {/* MODAL ALTERAR SENHA */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>

        <div className="space-y-4">

          <div>
            <label className="font-medium">Senha atual</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Nova senha</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button
            onClick={() => setIsPasswordModalOpen(false)}
            className="px-4 py-2 border rounded-lg"
          >
            Cancelar
          </button>

          <button
            onClick={handlePasswordUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Atualizar
          </button>
        </div>
      </Modal>

    </>
  );
}

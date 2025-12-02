"use client";

import { useState } from "react";
import Modal from "./Modal"; // o mesmo componente Modal que você usa no perfil
import { changePassword } from "@/services/api/changePassword";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

export default function ModalChangePassword({ isOpen, onClose, userId }: Props) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!oldPass || !newPass || !confirmPass) {
      return setErrorMsg("Preencha todos os campos.");
    }

    if (newPass !== confirmPass) {
      return setErrorMsg("A nova senha e a confirmação não coincidem.");
    }

    try {
      setLoading(true);
      await changePassword(userId, {
        OldPassword: oldPass,
        NewPassword: newPass,
      });

      setSuccessMsg("Senha alterada com sucesso!");

      setTimeout(() => {
        onClose();
        setOldPass("");
        setNewPass("");
        setConfirmPass("");
      }, 1000);

    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setErrorMsg(error.response?.data?.error || "Erro ao alterar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>

      <div className="space-y-4">
        <div>
          <label className="font-medium">Senha atual</label>
          <input
            type="password"
            className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
          />
        </div>

        <div>
          <label className="font-medium">Nova senha</label>
          <input
            type="password"
            className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
        </div>

        <div>
          <label className="font-medium">Confirmar nova senha</label>
          <input
            type="password"
            className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
          />
        </div>

        {errorMsg && <p className="text-red-600">{errorMsg}</p>}
        {successMsg && <p className="text-green-600">{successMsg}</p>}
      </div>

      <div className="flex justify-end mt-6 gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg"
          disabled={loading}
        >
          Cancelar
        </button>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </Modal>
  );
}

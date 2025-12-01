"use client";

import { UserProfile } from "@/types/global";

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: UserProfile[];
}

export default function UserListModal({ isOpen, onClose, title, users }: UserListModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-md w-full animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        {users.length === 0 ? (
          <p className="text-gray-500">Nenhum usuário encontrado.</p>
        ) : (
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <li key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                  {(user.name ?? "??").split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-gray-500 text-sm">@{user.nick}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { UserProfile } from "@/types/global";
import { useRouter } from "next/navigation";

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: UserProfile[];
  onFollowToggle?: (user: UserProfile) => void;
}

export default function UserListModal({
  isOpen,
  onClose,
  title,
  users,
  onFollowToggle
}: UserListModalProps) {
  const router = useRouter();

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
              <li
                key={user.id}
                className="flex items-center justify-between gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                onClick={() => router.push(`/profile/${user.id}`)} // 🔥 AQUI AJUSTADO
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    {(user.name ?? "??")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-gray-500 text-sm">@{user.nick}</p>
                  </div>
                </div>

                {onFollowToggle && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // impede abrir perfil ao clicar no botão
                      onFollowToggle(user);
                    }}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      user.isFollowed
                        ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {user.isFollowed ? "Seguindo" : "Seguir"}
                  </button>
                )}
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

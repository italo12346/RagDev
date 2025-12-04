// PostCard.jsx atualizado com botão Ver Comentários
"use client";

import { Post } from "@/types/global";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PostCardProps {
  post: Post;
  onLike: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (id: number) => void;
  onOpenComments?: (post: Post) => void; // 👈 NOVO
  showActions?: boolean;
  currentUserId?: number;
}

export default function PostCard({
  post,
  onLike,
  onEdit,
  onDelete,
  onOpenComments,
  showActions = true,
  currentUserId,
}: PostCardProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");

  const goToProfile = () => {
    if (post.author_id === currentUserId) {
      router.push("/profile");
    } else {
      router.push(`/profile/${post.author_id}`);
    }
  };

  const renderAvatar = () => {
    if (post.author_photo_url) {
      return (
        <img
          src={post.author_photo_url}
          className="w-10 h-10 rounded-full object-cover border cursor-pointer"
          onClick={goToProfile}
        />
      );
    }

    const letter = post.author_nickname?.[0]?.toUpperCase() ?? "?";

    return (
      <div
        className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold cursor-pointer"
        onClick={goToProfile}
      >
        {letter}
      </div>
    );
  };

  return (
    <div className="p-4 border rounded-xl bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center gap-3">
        {renderAvatar()}
        <div className="cursor-pointer" onClick={goToProfile}>
          <p className="font-semibold">{post.author_nickname}</p>
          <p className="text-sm text-gray-500">
            {new Date(post.created_at).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {post.title && (
        <h2 className="mt-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          {post.title}
        </h2>
      )}

      <p className="mt-2 text-gray-800 dark:text-gray-200">{post.content}</p>

      {feedback && (
        <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">{feedback}</p>
      )}

      <div className="flex items-center justify-between mt-4">
        
        {/* LIKE */}
        <button
          onClick={() => onLike(post)}
          className={`px-3 py-1 rounded-lg border ${
            post.likedByUser
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          }`}
        >
          👍 {post.likes ?? 0}
        </button>

        {/* BOTÃO DE COMENTÁRIOS */}
        {onOpenComments && (
          <button
            onClick={() => onOpenComments(post)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
          >
            💬 Ver comentários
          </button>
        )}

        {/* AÇÕES DO AUTOR */}
        {showActions && currentUserId === post.author_id && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(post)}
                className="px-3 py-1 bg-yellow-500 text-white rounded-lg"
              >
                Editar
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(post.id)}
                className="px-3 py-1 bg-red-600 text-white rounded-lg"
              >
                Excluir
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

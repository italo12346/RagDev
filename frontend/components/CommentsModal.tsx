"use client";

import { useEffect, useState } from "react";
import { getCommentsByPostId, createComment } from "@/services/api/posts";
import { getUserProfile } from "@/services/api/profile";

import { Post, PostComment, CommentWithUser } from "@/types/global";

interface CommentsModalProps {
  post: Post | null;
  onClose: () => void;
}

export default function CommentsModal({ post, onClose }: CommentsModalProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);


useEffect(() => {
  if (!post) return;

  let mounted = true;
  
  const postId = post.id; 
  
  async function load() {
      setLoading(true);
    try {
      const list = await getCommentsByPostId(postId);

      if (!mounted) return;

      const commentsWithNick: CommentWithUser[] = await Promise.all(
        list.map(async (c: PostComment) => {
          const user = await getUserProfile(c.authorId);
          return {
            ...c,
            author_nickname: user.nick,
          };
        })
      );

      setComments(commentsWithNick);
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
      setComments([]);
    }

    setLoading(false);
  }

  load();

  return () => {
    mounted = false;
  };
}, [post]);

  if (!post) return null;

  const handleSend = async () => {
    if (!newComment.trim()) return;

    setSending(true);

    try {
      const created = await createComment(post.id, newComment);

      if (created) {
        const user = await getUserProfile(created.authorId);

        setComments((prev) => [
          { ...created, author_nickname: user.nick },
          ...prev,
        ]);
      }

      setNewComment("");
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
    }

    setSending(false);
  };

  // -----------------------------------
  // Utils
  // -----------------------------------
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderAvatar = (nickname: string) => (
    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-2">
      {nickname[0]?.toUpperCase() ?? "?"}
    </div>
  );

  // -----------------------------------
  // 🔥 UI
  // -----------------------------------
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-3">Comentários</h2>

        {loading ? (
          <p>Carregando...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500">Nenhum comentário ainda.</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-4">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center">
                    {renderAvatar(c.author_nickname)}
                    <p className="font-semibold">{c.author_nickname}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(c.createdAt)}
                  </span>
                </div>

                <p>{c.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Campo de comentário */}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escreva um comentário..."
          className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 focus:outline-none"
          rows={3}
        />

        {/* Botão enviar */}
        <button
          onClick={handleSend}
          disabled={sending}
          className="mt-3 w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-60"
        >
          {sending ? "Enviando..." : "Enviar Comentário"}
        </button>

        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-lg bg-blue-600 text-white"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

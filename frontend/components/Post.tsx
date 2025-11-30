"use client";

import { useEffect, useState } from "react";
import { useProtectedRoute } from "@/hooks/useProtectRoute";
import {
  getUserPosts,
  createPost,
  deletePost,
  likePost,
  unlikePost,
  Post,
} from "@/services/api/posts";
import { decodeToken } from "@/utils/jwt";
import ModalCreatePost from "@/components/CreatePostModal";

export default function Posts() {
  useProtectedRoute();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const decoded = token ? decodeToken(token) : null;

  const fetchPosts = async () => {
    if (!decoded) return;

    try {
      setLoading(true);
      const data = await getUserPosts(decoded.user_id);
      setPosts(data);
    } catch (err) {
      console.error("Erro ao carregar posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const updatePost = (id: number, changes: Partial<Post>) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...changes } : p))
    );
  };

  const handleCreatePost = async (title: string, content: string) => {
    try {
      const newPost = await createPost({ title, content });
      setPosts((prev) => [newPost, ...prev]);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Erro ao criar post:", err);
    }
  };

  const handleLike = async (post: Post) => {
    try {
      if (post.likedByMe) {
        const res = await unlikePost(post.id);
        updatePost(post.id, { likes: res.likes, likedByMe: false });
      } else {
        const res = await likePost(post.id);
        updatePost(post.id, { likes: res.likes, likedByMe: true });
      }
    } catch (err) {
      console.error("Erro ao curtir:", err);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("Tem certeza que deseja excluir este post?")) return;

    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Erro ao excluir post:", err);
    }
  };

  // ------------------------------
  // GERAR AVATAR Fallback
  // ------------------------------
  const renderAvatar = (post: Post) => {
    if (post.author_photo_url)
      return (
        <img
          src={post.author_photo_url}
          className="w-10 h-10 rounded-full object-cover border"
          alt="foto"
        />
      );

    const letter = post.author_nickname?.[0]?.toUpperCase() ?? "?";

    return (
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
        {letter}
      </div>
    );
  };

  return (
    <div className="mt-4 space-y-4">

      {/* CRIAR POST */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Criar Post
      </button>

      <ModalCreatePost
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      {/* LISTA */}
      {posts.map((post) => (
        <div
          key={post.id}
          className="p-4 border rounded-xl bg-white dark:bg-gray-800 shadow-sm"
        >
          {/* Cabeçalho */}
          <div className="flex items-center gap-3">
            {renderAvatar(post)}

            <div>
              <p className="font-semibold">{post.author_nickname}</p>
              <p className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Conteúdo */}
          <p className="mt-3 text-gray-800 dark:text-gray-200">
            {post.content}
          </p>

          {/* AÇÕES */}
          <div className="flex items-center justify-between mt-4">

            {/* LIKE */}
            <button
              onClick={() => handleLike(post)}
              className={`px-3 py-1 rounded-lg border ${
                post.likedByMe
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              }`}
            >
              👍 {post.likes ?? 0}
            </button>

            {/* EDITAR / EXCLUIR */}
            {decoded?.user_id === post.author_id && (
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-yellow-500 text-white rounded-lg">
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(post.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-lg"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

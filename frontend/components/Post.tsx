"use client";

import { useEffect, useState } from "react";
import { useProtectedRoute } from "@/hooks/useProtectRoute";
import {
  getUserPosts,
  createPost,
  deletePost,
  likePost,
  unlikePost,
  updatePost as apiUpdatePost,
} from "@/services/api/posts";
import { decodeToken } from "@/utils/jwt";
import ModalCreatePost from "@/components/CreatePostModal";
import ModalEditPost from "@/components/ModalEditPost";
import { Post } from "@/types/global";
import PostCard from "./PostsCard";

export default function Posts() {
  useProtectedRoute();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const decoded = token ? decodeToken(token) : null;

  const fetchPosts = async () => {
    if (!decoded) return;

    try {
      setLoading(true);
      const data = await getUserPosts(decoded.user_id);
      // DEBUG: descomente para inspecionar o payload
      // console.log("posts recebidos:", data);
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

  const updatePostState = (id: number, changes: Partial<Post>) => {
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
        updatePostState(post.id, { likes: res.likes, likedByMe: false });
      } else {
        const res = await likePost(post.id);
        updatePostState(post.id, { likes: res.likes, likedByMe: true });
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

  const handleEdit = (post: Post) => {
    setEditingPost(post);
  };

  const handleUpdateSubmit = async (title: string, content: string) => {
    if (!editingPost) return;

    try {
      await apiUpdatePost(editingPost.id, { title, content });
      updatePostState(editingPost.id, { title, content });
      setEditingPost(null);
    } catch (err) {
      console.error("Erro ao atualizar post:", err);
    }
  };

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

      {/* EDITAR POST */}
      {editingPost && (
        <ModalEditPost
          key={editingPost.id}
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          onSubmit={handleUpdateSubmit}
          initialTitle={editingPost.title}
          initialContent={editingPost.content}
        />
      )}

      {/* LISTA */}
      {posts.map((post) => (
  <PostCard
    key={post.id}
    post={post}
    onLike={handleLike}
    onEdit={handleEdit}
    onDelete={handleDelete}
    currentUserId={decoded?.user_id}
  />
))}
    </div>
  );
}

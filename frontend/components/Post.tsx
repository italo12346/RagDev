"use client";

import ModalCreatePost from "@/components/CreatePostModal";
import ModalEditPost from "@/components/ModalEditPost";
import { useProtectedRoute } from "@/hooks/useProtectRoute";
import {
  updatePost as apiUpdatePost,
  createPost,
  deletePost,
  getUserPosts,
  likePost,
  unlikePost,
} from "@/services/api/posts";
import { Post } from "@/types/global";
import { decodeToken } from "@/utils/jwt";
import { useEffect, useState } from "react";
import CommentsModal from "./CommentsModal";
import PostCard from "./PostsCard";
// import CommentsModal from "@/components/CommentsModal"; // caso já exista

export default function Posts() {
  useProtectedRoute();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

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
      if (post.likedByUser) {
        const res = await unlikePost(post.id);
        updatePostState(post.id, { likes: res.likes, likedByUser: false });
      } else {
        const res = await likePost(post.id);
        updatePostState(post.id, { likes: res.likes, likedByUser: true });
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


  const handleOpenComments = (post: Post) => {
    setSelectedPost(post);
    setIsCommentsOpen(true);
  };

  return (
    <div className="mt-4 space-y-4">
      
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Criar Post
      </button>

      {/* Modal criar */}
      <ModalCreatePost
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      {/* Modal editar */}
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

      {/* LISTA DE POSTS */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onEdit={handleEdit}
          onDelete={handleDelete}
          currentUserId={decoded?.user_id}
          onOpenComments={handleOpenComments} 
        />
      ))}

      {/* MODAL DE COMENTÁRIOS */}
      { 
  <CommentsModal
    post={selectedPost}
    onClose={() => {
      setIsCommentsOpen(false);
      setSelectedPost(null);
    }}
  />
      }
    </div>
  );
}

"use client";

import { useProtectedRoute } from "@/hooks/useProtectRoute";
import { useCallback, useEffect, useState } from "react";

import {
  getFollowers,
  getFollowing,
  getUserPosts as getUserPostsProfile,
  getUserProfile,
  updateUserProfile,
} from "@/services/api/profile";

import {
  updatePost as apiUpdatePost,
  deletePost,
  likePost,
  unlikePost,
} from "@/services/api/posts";

import Modal from "@/components/Modal";
import ModalEditPost from "@/components/ModalEditPost";
import ModalChangePassword from "@/components/ChangePasswordModal";
import PostCard from "@/components/PostsCard";
import UserListModal from "@/components/UserListModal";

import type { Post, UserProfile as UserProfileType } from "@/types/global";

export default function ProfilePage() {
  useProtectedRoute();

  const [userData, setUserData] = useState<UserProfileType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // seguidores / seguindo
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // listas de usuários
  const [followersList, setFollowersList] = useState<UserProfileType[]>([]);
  const [followingList, setFollowingList] = useState<UserProfileType[]>([]);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);

  // editar perfil
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNick, setEditNick] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // modal alterar senha
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // editar post
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);

  // token
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const decodedToken =
    token && token.includes(".") ? JSON.parse(atob(token.split(".")[1])) : null;
  const loggedUserId = decodedToken?.user_id ?? null;

  // carregar perfil
  const fetchProfile = useCallback(async () => {
    if (!loggedUserId) return;
    try {
      setLoadingProfile(true);
      const data = await getUserProfile(loggedUserId);
      setUserData(data);
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
    } finally {
      setLoadingProfile(false);
    }
  }, [loggedUserId]);

  // carregar posts
  const fetchPosts = useCallback(async () => {
    if (!loggedUserId) return;
    try {
      setLoadingPosts(true);
      const data = await getUserPostsProfile(loggedUserId);
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar posts:", err);
    } finally {
      setLoadingPosts(false);
    }
  }, [loggedUserId]);

  // carregar seguidores / seguindo
  useEffect(() => {
    if (!loggedUserId) return;

    async function loadCounts() {
      try {
        const followers = await getFollowers(loggedUserId);
        const following = await getFollowing(loggedUserId);

        setFollowersCount(followers.length ?? 0);
        setFollowingCount(following.length ?? 0);
      } catch (err) {
        console.error("Erro ao buscar seguidores/seguindo:", err);
      }
    }

    loadCounts();
  }, [loggedUserId]);

  // carregar tudo
  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  // abrir modal editar perfil
  const openEditProfile = () => {
    if (!userData) return;
    setEditName(userData.name ?? "");
    setEditNick(userData.nick ?? "");
    setEditEmail(userData.email ?? "");
    setIsEditProfileOpen(true);
  };

  // salvar alterações
  const handleSaveProfile = async () => {
    if (!userData) return;

    if (!editName.trim() || !editNick.trim() || !editEmail.trim()) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      const updated = await updateUserProfile(userData.id, {
        name: editName,
        nick: editNick,
        email: editEmail,
      });
      setUserData(updated);
      setIsEditProfileOpen(false);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      alert("Erro ao atualizar perfil.");
    }
  };

  // like / unlike
  const handleLike = async (post: Post) => {
    try {
      if (post.likedByUser) {
        const res = await unlikePost(post.id);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id ? { ...p, likes: res.likes, likedByUser: false } : p
          )
        );
      } else {
        const res = await likePost(post.id);
        setPosts((prev) =>
          prev.map((p) =>
            p.id === post.id ? { ...p, likes: res.likes, likedByUser: true } : p
          )
        );
      }
    } catch (err) {
      console.error("Erro ao curtir/descurtir:", err);
    }
  };

  // deletar
  const handleDelete = async (postId: number) => {
    if (!confirm("Deseja excluir este post?")) return;
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Erro ao deletar post:", err);
    }
  };

  // abrir edição de post
  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setIsEditPostOpen(true);
  };

  // salvar edição de post
  const handleSavePostEdit = async (title: string, content: string) => {
    if (!editingPost) return;
    try {
      await apiUpdatePost(editingPost.id, { title, content });

      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id ? { ...p, title, content } : p
        )
      );

      setIsEditPostOpen(false);
      setEditingPost(null);
    } catch (err) {
      console.error("Erro ao atualizar post:", err);
      alert("Erro ao atualizar o post.");
    }
  };

  if (loadingProfile)
    return <p className="text-center mt-10">Carregando perfil...</p>;

  if (!userData)
    return <p className="text-center mt-10">Usuário não encontrado.</p>;

  const initials = (userData.name ?? "??")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {/* PERFIL */}
      <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-900 shadow-lg rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-blue-600 text-white text-3xl font-bold flex items-center justify-center">
            {initials}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center">{userData.name}</h1>
        <p className="text-center text-gray-500">@{userData.nick}</p>

        {/* seguidores e seguindo */}
        <div className="mt-6 flex justify-center gap-10 text-center">
          <div
            onClick={async () => {
              const followers = await getFollowers(loggedUserId);
              setFollowersList(Array.isArray(followers) ? followers : []);
              setFollowersModalOpen(true);
            }}
            className="cursor-pointer"
          >
            <p className="text-xl font-bold">{followersCount}</p>
            <p className="text-gray-500">Seguidores</p>
          </div>

          <div className="w-px h-10 bg-gray-300"></div>

          <div
            onClick={async () => {
              const following = await getFollowing(loggedUserId);
              setFollowingList(Array.isArray(following) ? following : []);
              setFollowingModalOpen(true);
            }}
            className="cursor-pointer"
          >
            <p className="text-xl font-bold">{followingCount}</p>
            <p className="text-gray-500">Seguindo</p>
          </div>
        </div>

        <div className="mt-6 text-gray-700 dark:text-gray-300 space-y-2">
          <p>
            <strong>Email:</strong> {userData.email}
          </p>
          <p>
            <strong>Criado em:</strong>{" "}
            {new Date(userData.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={openEditProfile}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Editar Perfil
          </button>
        </div>
      </div>

      {/* POSTS */}
      <div className="max-w-md mx-auto mt-6 space-y-4">
        <h2 className="text-xl font-bold mb-2">Meus Posts</h2>

        {loadingPosts ? (
          <p>Carregando posts...</p>
        ) : posts.length === 0 ? (
          <p>Você ainda não publicou nenhum post.</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
              onEdit={handleEdit}
              showActions={true}
              currentUserId={loggedUserId ?? undefined}
            />
          ))
        )}
      </div>

      {/* MODAL PERFIL */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
      >
        <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>

        <div className="space-y-4">
          <div>
            <label className="font-medium">Nome</label>
            <input
              className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Nick</label>
            <input
              className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              value={editNick}
              onChange={(e) => setEditNick(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Email</label>
            <input
              className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Senha</label>
            <div className="flex gap-2">
              <input
                className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500"
                value="********"
                disabled
              />
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg mt-1"
              >
                Alterar
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button
            onClick={() => setIsEditProfileOpen(false)}
            className="px-4 py-2 border rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Salvar
          </button>
        </div>
      </Modal>

      {/* MODAL ALTERAR SENHA */}
      <ModalChangePassword
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        userId={loggedUserId}
      />

      {/* MODAL EDITAR POST */}
      {editingPost && (
        <ModalEditPost
          isOpen={isEditPostOpen}
          onClose={() => {
            setIsEditPostOpen(false);
            setEditingPost(null);
          }}
          onSubmit={handleSavePostEdit}
          initialTitle={editingPost.title}
          initialContent={editingPost.content}
        />
      )}

      {/* MODAL SEGUIDORES */}
      <UserListModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        title="Seguidores"
        users={followersList}
      />

      {/* MODAL SEGUINDO */}
      <UserListModal
        isOpen={followingModalOpen}
        onClose={() => setFollowingModalOpen(false)}
        title="Seguindo"
        users={followingList}
      />
    </>
  );
}

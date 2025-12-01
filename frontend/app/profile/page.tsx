"use client";

import { useProtectedRoute } from "@/hooks/useProtectRoute";
import { useCallback, useEffect, useState } from "react";

import {
  getUserPosts as getUserPostsProfile,
  getUserProfile,
  updateUserProfile,
  getFollowers,
  getFollowing
} from "@/services/api/profile";

import {
  updatePost as apiUpdatePost,
  deletePost,
  likePost,
  unlikePost
} from "@/services/api/posts";

import { changePassword, ChangePasswordPayload } from "@/services/api/changePassword";

import Modal from "@/components/Modal";
import ModalEditPost from "@/components/ModalEditPost";
import PostCard from "@/components/PostsCard";

import type { Post, UserProfile as UserProfileType } from "@/types/global";

export default function ProfilePage() {
  useProtectedRoute();

  // ----------------- STATES -----------------
  const [userData, setUserData] = useState<UserProfileType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Modal editar perfil
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNick, setEditNick] = useState("");
  const [editEmail, setEditEmail] = useState("");

  // Modal editar post
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);

  // Modal mudar senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // userId do token
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const decodedToken = token && token.includes(".") ? JSON.parse(atob(token.split(".")[1])) : null;
  const loggedUserId = decodedToken?.user_id ?? null;

  // ----------------- FETCH PROFILE -----------------
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

  // ----------------- FETCH POSTS -----------------
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

  // ----------------- FETCH FOLLOWERS/FOLLOWING -----------------
  useEffect(() => {
    if (!loggedUserId) return;

    async function loadFollows() {
      try {
        const followers = await getFollowers(loggedUserId);
        const following = await getFollowing(loggedUserId);

        setFollowersCount(followers.length ?? 0);
        setFollowingCount(following.length ?? 0);
      } catch (err) {
        console.error("Erro ao buscar seguidores/seguindo:", err);
      }
    }

    loadFollows();
  }, [loggedUserId]);

  // ----------------- LOAD INITIAL DATA -----------------
  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  // ----------------- EDIT PROFILE -----------------
  const openEditProfile = () => {
    if (!userData) return;
    setEditName(userData.name ?? "");
    setEditNick(userData.nick ?? "");
    setEditEmail(userData.email ?? "");
    setIsEditProfileOpen(true);
  };

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
        email: editEmail
      });
      setUserData(updated);
      setIsEditProfileOpen(false);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      alert("Erro ao atualizar perfil.");
    }
  };

  // ----------------- CHANGE PASSWORD -----------------
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("A nova senha e a confirmação não coincidem.");
      return;
    }

    try {
      if (!loggedUserId) return;

      const payload: ChangePasswordPayload = {
        OldPassword: currentPassword,
        NewPassword: newPassword,
      };

      await changePassword(loggedUserId, payload);

      alert("Senha alterada com sucesso!");
      setIsPasswordModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Erro ao alterar senha:", err);
      alert("Erro ao alterar senha. Verifique a senha atual.");
    }
  };

  // ----------------- POSTS ACTIONS -----------------
  const handleLike = async (post: Post) => {
    try {
      if (post.likedByMe) {
        const res = await unlikePost(post.id);
        setPosts(prev => prev.map(p => (
          p.id === post.id ? { ...p, likes: res.likes, likedByMe: false } : p
        )));
      } else {
        const res = await likePost(post.id);
        setPosts(prev => prev.map(p => (
          p.id === post.id ? { ...p, likes: res.likes, likedByMe: true } : p
        )));
      }
    } catch (err) {
      console.error("Erro ao curtir post:", err);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("Deseja excluir este post?")) return;
    try {
      await deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error("Erro ao deletar post:", err);
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setIsEditPostOpen(true);
  };

  const handleSavePostEdit = async (title: string, content: string) => {
    if (!editingPost) return;
    try {
      await apiUpdatePost(editingPost.id, { title, content });

      setPosts(prev =>
        prev.map(p =>
          p.id === editingPost.id ? { ...p, title, content } : p
        )
      );

      setIsEditPostOpen(false);
      setEditingPost(null);
    } catch (err) {
      console.error("Erro ao atualizar post:", err);
      alert("Erro ao atualizar post.");
    }
  };

  // ----------------- RENDER -----------------
  if (loadingProfile)
    return <p className="text-center mt-10">Carregando perfil...</p>;

  if (!userData)
    return <p className="text-center mt-10">Usuário não encontrado.</p>;

  const initials = (userData.name ?? "??")
    .split(" ")
    .map(n => n[0])
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

        <div className="mt-6 flex justify-center gap-10 text-center">
          <div>
            <p className="text-xl font-bold">{followersCount}</p>
            <p className="text-gray-500">Seguidores</p>
          </div>
          <div className="w-px h-10 bg-gray-300"></div>
          <div>
            <p className="text-xl font-bold">{followingCount}</p>
            <p className="text-gray-500">Seguindo</p>
          </div>
        </div>

        <div className="mt-6 text-gray-700 dark:text-gray-300 space-y-2">
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Criado em:</strong> {new Date(userData.createdAt).toLocaleDateString("pt-BR")}</p>
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
          posts.map(post => (
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

      {/* MODAL EDITAR PERFIL */}
      <Modal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>

        <div className="space-y-4">
          <div>
            <label className="font-medium">Nome</label>
            <input
              className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              value={editName}
              onChange={e => setEditName(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Nick</label>
            <input
              className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              value={editNick}
              onChange={e => setEditNick(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Email</label>
            <input
              className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              value={editEmail}
              onChange={e => setEditEmail(e.target.value)}
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
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg mt-1"
              >
                Alterar
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button onClick={() => setIsEditProfileOpen(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
          <button onClick={handleSaveProfile} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Salvar</button>
        </div>
      </Modal>

      {/* MODAL MUDAR SENHA */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>

        <div className="space-y-4">
          <div>
            <label className="font-medium">Senha Atual</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Nova Senha</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Confirmar Nova Senha</label>
            <input
              type="password"
              className="w-full mt-1 p-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-2">
          <button onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
          <button onClick={handleChangePassword} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Salvar</button>
        </div>
      </Modal>

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
    </>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

import {
  getUserProfile,
  getUserPosts,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkIsFollowing,
} from "@/services/api/profile";

import type { UserProfile, Post } from "@/types/global";
import PostCard from "@/components/PostsCard";
import UserListModal from "@/components/UserListModal";

export default function ProfilePageUser() {
  const params = useParams();
  const userId = Number(params?.id);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para modais
  const [openFollowers, setOpenFollowers] = useState(false);
  const [openFollowing, setOpenFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<UserProfile[]>([]);
  const [followingList, setFollowingList] = useState<UserProfile[]>([]);

  // Buscar perfil completo
  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const [data, followers, following, statusFollow] = await Promise.all([
        getUserProfile(userId),
        getFollowers(userId),
        getFollowing(userId),
        checkIsFollowing(userId),
      ]);

      setUser({
        ...data,
        followers: followers.length,
        following: following.length,
        isFollowed: statusFollow.isFollowing,
        followedBack: statusFollow.followedBack,
      });
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      setError("Não foi possível carregar o perfil.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Buscar posts
  const fetchPosts = useCallback(async () => {
    if (!userId) return;

    try {
      setLoadingPosts(true);
      const data = await getUserPosts(userId);
      setPosts(data);
    } catch (err) {
      console.error("Erro ao carregar posts:", err);
      setError("Não foi possível carregar os posts.");
    } finally {
      setLoadingPosts(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  // Seguir/Deixar de seguir
  const handleFollowToggle = async () => {
    if (!user) return;
    setIsFollowLoading(true);

    try {
      if (user.isFollowed) {
        await unfollowUser(user.id);
        setUser({
          ...user,
          isFollowed: false,
          followers: (user.followers ?? 1) - 1,
          followedBack: false,
        });
      } else {
        await followUser(user.id);
        setUser({
          ...user,
          isFollowed: true,
          followers: (user.followers ?? 0) + 1,
        });
      }
    } catch (err) {
      console.error("Erro ao seguir/deixar de seguir:", err);
      setError("Não foi possível atualizar o status de seguir.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Abrir lista de seguidores
  const handleOpenFollowers = async () => {
    setOpenFollowers(true);
    const data = await getFollowers(userId);
    setFollowersList(data);
  };

  // Abrir lista de seguindo
  const handleOpenFollowing = async () => {
    setOpenFollowing(true);
    const data = await getFollowing(userId);
    setFollowingList(data);
  };

  if (loading) return <p className="text-center mt-8">Carregando perfil...</p>;
  if (!user) return <p className="text-center mt-8">Usuário não encontrado</p>;

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xl font-bold text-gray-700 dark:text-gray-200">
            {user.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">@{user.nick}</p>

            {user.followedBack && (
              <p className="text-sm text-green-600 dark:text-green-400">Segue você</p>
            )}
          </div>

          <button
            onClick={handleFollowToggle}
            disabled={isFollowLoading}
            className={`px-4 py-2 rounded-lg font-medium transition
              ${
                user.isFollowed
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }
            `}
          >
            {isFollowLoading
              ? "..."
              : user.isFollowed
              ? "Seguindo"
              : user.followedBack
              ? "Seguir de volta"
              : "Seguir"}
          </button>
        </div>

        {/* Followers / Following */}
        <div className="mt-4 flex gap-4 text-gray-600 dark:text-gray-400">
          <button
            onClick={handleOpenFollowing}
            className="hover:underline"
          >
            {user.following ?? 0} seguindo
          </button>

          <button
            onClick={handleOpenFollowers}
            className="hover:underline"
          >
            {user.followers ?? 0} seguidores
          </button>
        </div>

        {error && <p className="mt-4 text-red-500">{error}</p>}

        {/* Posts */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Publicações
          </h2>

          {loadingPosts ? (
            <p className="text-gray-500 dark:text-gray-400">Carregando posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Nenhum post encontrado.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => {}}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <UserListModal
        isOpen={openFollowers}
        onClose={() => setOpenFollowers(false)}
        title="Seguidores"
        users={followersList}
      />

      <UserListModal
        isOpen={openFollowing}
        onClose={() => setOpenFollowing(false)}
        title="Seguindo"
        users={followingList}
      />
    </>
  );
}

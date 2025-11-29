"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  getUserProfile,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
} from "@/services/api/profile";
import { getUserPosts } from "@/services/api/posts";

interface UserProfile {
  id: number;
  name: string;
  nick: string;
  followers?: number;
  following?: number;
  isFollowed?: boolean;
}

interface Post {
  id: number;
  authorId: number;
  content: string;
  createdAt: string;
}

interface Follower {
  id: number;
  name?: string;
  nick?: string;
}

interface JwtPayload {
  user_id: number;
}

export default function ProfilePageUser() {
  const params = useParams();
  const id = Number(params?.id);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [data, followers, following] = await Promise.all([
        getUserProfile(id),
        getFollowers(id),
        getFollowing(id),
      ]);

      let isFollowed = false;
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded: JwtPayload = JSON.parse(atob(token.split(".")[1]));
          isFollowed = (followers as Follower[]).some(f => f.id === decoded.user_id);
        } catch {
          console.warn("Token inválido ou expirado");
        }
      }

      setUser({
        ...data,
        followers: followers.length,
        following: following.length,
        isFollowed,
      });
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      setError("Não foi possível carregar o perfil.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchPosts = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingPosts(true);
      const data = await getUserPosts(id);
      setPosts(data);
    } catch (err) {
      console.error("Erro ao carregar posts:", err);
      setError("Não foi possível carregar os posts.");
    } finally {
      setLoadingPosts(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  const handleFollowToggle = async () => {
    if (!user) return;
    setIsFollowLoading(true);

    try {
      if (user.isFollowed) {
        await unfollowUser(user.id);
        setUser({ ...user, isFollowed: false, followers: (user.followers ?? 1) - 1 });
      } else {
        await followUser(user.id);
        setUser({ ...user, isFollowed: true, followers: (user.followers ?? 0) + 1 });
      }
    } catch (err) {
      console.error("Erro ao seguir/deixar de seguir:", err);
      setError("Não foi possível atualizar o status de seguir.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-8">Carregando perfil...</p>;
  if (!user) return <p className="text-center mt-8">Usuário não encontrado</p>;

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xl font-bold text-gray-700 dark:text-gray-200">
          {user.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?"}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">@{user.nick}</p>
        </div>

        <button
          onClick={handleFollowToggle}
          disabled={isFollowLoading}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            user.isFollowed
              ? "bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isFollowLoading ? "..." : user.isFollowed ? "Seguindo" : "Seguir"}
        </button>
      </div>

      <div className="mt-4 flex gap-4 text-gray-600 dark:text-gray-400">
        <span>{user.followers ?? 0} seguidores</span>
        <span>{user.following ?? 0} seguindo</span>
      </div>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Posts</h2>
        {loadingPosts ? (
          <p>Carregando posts...</p>
        ) : posts.length === 0 ? (
          <p>Sem posts ainda.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {posts.map(post => (
              <li
                key={post.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
              >
                <p className="text-gray-900 dark:text-gray-100">{post.content}</p>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(post.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

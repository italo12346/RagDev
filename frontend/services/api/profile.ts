import api from "./axios";
import { Post, UpdateUserPayload, UserProfile } from "@/types/global";

// Buscar perfil do usuário por ID
export async function getUserProfile(userId: number): Promise<UserProfile> {
  try {
    const response = await api.get(`/users/${userId}`);
    console.log("📌 Perfil carregado:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar perfil:", error);
    throw error;
  }
}

// Buscar posts do usuário (filtro feito no front)
export async function getUserPosts(userId: number): Promise<Post[]> {
  const response = await api.get("/posts");

  const allPosts = Array.isArray(response.data) ? response.data : [];

  return allPosts.filter((post) => post.author_id === userId);
}

// Atualizar perfil
export async function updateUserProfile(
  userId: number,
  payload: UpdateUserPayload
) {
  const response = await api.put(`/users/${userId}`, payload);
  return response.data;
}

// Followers / Following
export async function getFollowers(userId: number) {
  const response = await api.get(`/user/${userId}/followers`);
  return response.data; // array
}

export async function getFollowing(userId: number) {
  const response = await api.get(`/user/${userId}/following`);
  return response.data; // array
}

// Seguir usuário
export async function followUser(userId: number) {
  await api.post(`/user/${userId}/userFollowed`);
}

// Deixar de seguir
export async function unfollowUser(userId: number) {
  await api.post(`/user/${userId}/unfollowed`);
}
// Checar se está seguindo
export async function checkIsFollowing(userId: number) {
  const response = await api.get(`/users/${userId}/is-following`);
  return response.data; // { isFollowing: boolean, followedBack: boolean }
}
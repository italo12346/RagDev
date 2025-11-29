import api from "./axios";
interface UpdateUserPayload {
  name?: string;
  email?: string;
  nick?: string;
}
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  nick: string;
  avatarUrl?: string;
  bio?: string;
  followers?: number;
  following?: number;
  isFollowed?: boolean; // se o usuário logado segue este
}
export async function getUserProfile(userId: number) {
  try {
    const response = await api.get(`/users/${userId}`);
    console.log("📌 Dados do usuário logado:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar perfil:", error);
    throw error;
  }
}

export async function updateUserProfile(userId: number, payload: UpdateUserPayload) {
  const response = await api.put(`/users/${userId}`, payload);
  return response.data;
}


export async function getFollowers(userId: number) {
  const response = await api.get(`/user/${userId}/followers`);
  return response.data; // array de usuários
}

export async function getFollowing(userId: number) {
  const response = await api.get(`/user/${userId}/following`);
  return response.data; // array de usuários
}

export async function followUser(userId: number) {
  await api.post(`/user/${userId}/userFollowed`);
}

export async function unfollowUser(userId: number) {
  await api.post(`/user/${userId}/unfollowed`);
}

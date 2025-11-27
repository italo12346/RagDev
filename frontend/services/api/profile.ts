import api from "./axios";
interface UpdateUserPayload {
  name?: string;
  email?: string;
  nick?: string;
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

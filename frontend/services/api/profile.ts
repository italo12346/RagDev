import api from "./axios";

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

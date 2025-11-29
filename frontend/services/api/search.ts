import api from "./axios";

export async function searchUsers(query: string) {
  const response = await api.get(`/users?user=${query}`);
  return response.data; // espera que retorne array de usuários
}

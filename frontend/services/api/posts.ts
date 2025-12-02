import axios from "axios";
import api from "./axios";
import { Post } from "@/types/global";


// Lista posts por usuário
export async function getUserPosts(userId: number): Promise<Post[]> {
  const response = await api.get(`/posts?authorId=${userId}`);

  if (!Array.isArray(response.data)) return [];

  // Normaliza o nome do campo vindo do backend
  return response.data.map((post: Post) => ({
    ...post,
    likedByMe: post.likedByUser, // 👈 AQUI ESTÁ A CORREÇÃO!!!
  }));
}
// Criar post
export async function createPost(data: { title: string; content: string }): Promise<Post> {
  const response = await api.post("/posts", data);
  return response.data;
}

// Curtir
export async function likePost(postId: number) {
  try {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  } catch (err: unknown) {
    console.error("Erro ao curtir:", err);

    // Narrowing: verificar se é um erro do Axios
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;

      if (status === 500) {
        return { message: "Você já curtiu este post." };
      }

      return { message: "Erro ao curtir o post. Tente novamente." };
    }

    // Caso seja algum outro tipo de erro desconhecido
    return { message: "Erro inesperado ao curtir o post." };
  }
}

// Remover like
export async function unlikePost(postId: number) {
  const response = await api.delete(`/posts/${postId}/unlike`);
  return response.data;
}

// Deletar post
export async function deletePost(postId: number) {
  await api.delete(`/posts/${postId}`);
}
// Atualizar post
export async function updatePost(
  postId: number,
  data: { title: string; content: string }
): Promise<Post> {
  const response = await api.put(`/posts/${postId}`, data);
  return response.data;
}
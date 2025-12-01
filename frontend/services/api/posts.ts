import api from "./axios";
import { Post } from "@/types/global";


// Lista posts por usuário
export async function getUserPosts(userId: number): Promise<Post[]> {
  const response = await api.get(`/posts?authorId=${userId}`);
  return Array.isArray(response.data) ? response.data : [];
}

// Criar post
export async function createPost(data: { title: string; content: string }): Promise<Post> {
  const response = await api.post("/posts", data);
  return response.data;
}

// Curtir
export async function likePost(postId: number) {
  const response = await api.post(`/posts/${postId}/like`);
  return response.data;
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
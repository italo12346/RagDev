
import api from "./axios";

export interface Post {
  id: number;
  authorId: number;
  content: string;
  createdAt: string;
}

export async function getUserPosts(userId: number): Promise<Post[]> {
  const response = await api.get(`/posts?authorId=${userId}`);
  // Se não existir posts, retorna array vazio
  const data: Post[] = response.data ?? [];
  return data.filter(post => post.authorId === userId);
}
import axios from "axios";
import api from "./axios";
import { CommentWithUser, Post, PostComment } from "@/types/global";


// Lista posts por usuário
export async function getUserPosts(userId: number): Promise<Post[]> {
  const response = await api.get(`/posts?authorId=${userId}`);

  if (!Array.isArray(response.data)) return [];

  // Normaliza o nome do campo vindo do backend
  return response.data.map((post: Post) => ({
    ...post,
    likedByMe: post.likedByUser,
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

    if (axios.isAxiosError(err)) {
      const status = err.response?.status;

      if (status === 500) {
        return { message: "Você já curtiu este post." };
      }

      return { message: "Erro ao curtir o post. Tente novamente." };
    }

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


// Criar comentário
export async function createComment(
  postId: number,
  content: string
): Promise<PostComment | null> {
  try {
    const res = await api.post(`/posts/${postId}/comments`, { postId, content });

    if (!res.data) return null;

    return res.data;
  } catch (err) {
    console.error("Erro ao criar comentário:", err);
    return null;
  }
}

// Deletar comentário
export async function deleteComment(commentId: number): Promise<boolean> {
  try {
    await api.delete(`/comments/${commentId}`);
    return true;
  } catch (err) {
    console.error("Erro ao deletar comentário:", err);
    return false;
  }
}

// Buscar comentários por ID do post
export async function getCommentsByPostId(postId: number): Promise<PostComment[]> {
  try {
    const res = await api.get(`/posts/${postId}/comments`);

    if (!Array.isArray(res.data)) {
      console.warn("API retornou formato inesperado:", res.data);
      return [];
    }

    return res.data;
  } catch (err) {
    console.error("Erro ao buscar comentários:", err);
    return [];
  }
}

export async function getCommentsWithUsers(postId: number): Promise<CommentWithUser[]> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/comments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) return [];

  const comments: PostComment[] = await res.json();

  if (!Array.isArray(comments)) return [];

  // Mapeia todos em paralelo
  const enriched = await Promise.all(
    comments.map(async (comment) => {
      const profileRes = await fetch(`http://localhost:3000/profile/${comment.authorId}`);
      if (!profileRes.ok) {
        return { ...comment, author_nickname: "Usuário desconhecido" };
      }

      const profile = await profileRes.json();

      return {
        ...comment,
        author_nickname: profile.nickname ?? "Sem nome",
      };
    })
  );

  return enriched;
}
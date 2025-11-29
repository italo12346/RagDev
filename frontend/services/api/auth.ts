import api from "./axios";
import { AxiosError } from "axios";

export interface LoginResponse {
  token: string;
}

// Função para fazer login
export async function login(email: string, password: string): Promise<string> {
  try {
    const response = await api.post<LoginResponse>("/login", { email, password });
    
    const token = typeof response.data === "string" ? response.data : response.data.token;
    localStorage.setItem("token", token);
    console.log("Resposta da API:", response.data);
  
    if (!token) {
      throw new Error("Token não recebido da API");
    }

    localStorage.setItem("token", token);
    return token;

  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        throw new Error("INVALID_CREDENTIALS");
      } else if (err.response?.status === 500) {
        throw new Error("SERVER_ERROR");
      } else {
        throw new Error(err.response?.data?.error || "LOGIN_FAILED");
      }
    }
    if (err instanceof Error) throw err;

    throw new Error("LOGIN_FAILED");
  }
}

// Função para logout
export function logout() {
  localStorage.removeItem("token");
}
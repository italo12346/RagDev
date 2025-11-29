import api from "./axios";
export interface RegisterPayload {
  name: string;
  nick: string;
  email: string;
  password: string;
}

export async function registerUser(payload: RegisterPayload) {
  const response = await api.post("/users", payload);
  return response.data;
}

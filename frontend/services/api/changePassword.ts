import api from "./axios";

export interface ChangePasswordPayload {
  OldPassword: string;
  NewPassword: string;
}

export async function changePassword(
  userId: number,
  payload: ChangePasswordPayload
) {
  try {
    const response = await api.post(`/user/${userId}/password-update`, payload);
    return response.data;
  } catch (error) {
    console.error("Erro ao alterar a senha:", error);
    throw error;
  }
}

package model

// Representa a estrutura para atualização de senha
type Password struct {
	OldPassword string `json:"oldPassword"`
	NewPassword string `json:"newPassword"`
}

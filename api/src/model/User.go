package model

import (
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// User representa um usuário do sistema
type User struct {
	ID        uint64 `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Nick      string `json:"nick"`
	Password  string `json:"password,omitempty"`
	CreatedAt string `json:"createdAt"`
}

// Prepare valida e formata os dados do usuário antes de salvar
func (u *User) Prepare(stage string) error {
	if err := u.validate(stage); err != nil {
		return err
	}

	u.format()
	if stage == "create" { // só gera hash na criação
		return u.hashPassword()
	}
	return nil
}

// validate checa se todos os campos obrigatórios estão preenchidos e válidos
func (u *User) validate(stage string) error {
	if strings.TrimSpace(u.Name) == "" {
		return errors.New("o nome é obrigatório")
	}

	if strings.TrimSpace(u.Nick) == "" {
		return errors.New("o nick é obrigatório")
	}

	if strings.TrimSpace(u.Email) == "" {
		return errors.New("o email é obrigatório")
	}

	if !strings.Contains(u.Email, "@") || !strings.Contains(u.Email, ".") {
		return errors.New("o email informado é inválido")
	}

	if stage == "create" && len(u.Password) < 6 {
		return errors.New("a senha deve conter pelo menos 6 caracteres")
	}

	return nil
}

// format padroniza os campos do usuário
func (u *User) format() {
	u.Name = strings.TrimSpace(u.Name)
	u.Nick = strings.TrimSpace(u.Nick)
	u.Email = strings.ToLower(strings.TrimSpace(u.Email))
}

// hashPassword gera um hash seguro da senha
func (u *User) hashPassword() error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

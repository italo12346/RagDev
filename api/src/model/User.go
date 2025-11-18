package model

import (
	"errors"
	"strings"

	"api/src/security"

	"github.com/badoux/checkmail"
)

type User struct {
	ID        uint64 `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Nick      string `json:"nick"`
	Password  string `json:"password,omitempty"`
	CreatedAt string `json:"createdAt"`
}

func (u *User) Prepare(stage string) error {
	if err := u.validate(stage); err != nil {
		return err
	}

	u.format()

	// Update sem senha → não altera
	if stage == "update" && u.Password == "" {
		return nil
	}

	// Se enviaram senha → hashear
	if u.Password != "" {
		hashed, err := security.HashPassword(u.Password)
		if err != nil {
			return err
		}
		u.Password = hashed
	}

	return nil
}

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

	if err := checkmail.ValidateFormat(u.Email); err != nil {
		return err
	}

	if !strings.Contains(u.Email, "@") {
		return errors.New("email inválido")
	}

	if stage == "create" && len(u.Password) < 6 {
		return errors.New("a senha deve conter pelo menos 6 caracteres")
	}

	return nil
}

func (u *User) format() {
	u.Name = strings.TrimSpace(u.Name)
	u.Nick = strings.TrimSpace(u.Nick)
	u.Email = strings.ToLower(strings.TrimSpace(u.Email))
}

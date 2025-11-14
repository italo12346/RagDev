package model

import (
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"
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

	// Se NÃO enviaram senha no update → não gerar hash
	if stage == "update" && u.Password == "" {
		return nil
	}

	// Se enviaram senha → sempre gerar hash
	if u.Password != "" {
		return u.hashPassword()
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

func (u *User) hashPassword() error {
	hashed, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashed)
	return nil
}

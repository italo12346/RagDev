package controllers

import (
	"api/src/database"
	"api/src/model"
	"api/src/repository"
	"api/src/security"
	"encoding/json"
	"io"
	"net/http"
)

func Login(w http.ResponseWriter, r *http.Request) {
	bodyRequest, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Erro ao ler o corpo da requisição", http.StatusBadRequest)
		return
	}

	var user model.User
	if err := json.Unmarshal(bodyRequest, &user); err != nil {
		http.Error(w, "JSON inválido: "+err.Error(), http.StatusBadRequest)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco de dados: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()
	repository := repository.NewUserRepository(db)

	storedUser, err := repository.FindByEmail(user.Email)
	if err != nil {
		http.Error(w, "Erro ao buscar usuário", http.StatusInternalServerError)
		return
	}
	securityErr := security.CheckPasswordHash(user.Password, storedUser.Password)
	if securityErr != nil {
		http.Error(w, "Usuário ou senha inválidos", http.StatusUnauthorized)
		return
	}
	w.Write([]byte("Logado com sucesso"))
}

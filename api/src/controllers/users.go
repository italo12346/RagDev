package controllers

import (
	"api/src/database"
	"api/src/model"
	"api/src/repository"
	"encoding/json"
	"net/http"
)

func CreateUser(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var user model.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	// 🔒 Gera o hash da senha antes de salvar
	if err := user.Prepare("create"); err != nil {
		http.Error(w, "Erro ao processar senha: "+err.Error(), http.StatusInternalServerError)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco de dados: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewUserRepository(db)
	userID, err := repo.Create(user)
	if err != nil {
		http.Error(w, "Erro ao criar usuário: "+err.Error(), http.StatusInternalServerError)
		return
	}

	user.ID = userID
	user.Password = "" // nunca retornar senha no JSON

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Get Users"))
}
func GetUser(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Get a User"))
}
func UpdateUser(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Update User"))
}
func DeleteUser(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Delete User"))
}

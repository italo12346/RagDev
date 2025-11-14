package controllers

import (
	"api/src/database"
	"api/src/model"
	"api/src/repository"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
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
	nameOrNick := r.URL.Query().Get("user")

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco de dados: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewUserRepository(db)
	users, err := repo.GetAll(nameOrNick)
	if err != nil {
		http.Error(w, "Erro ao buscar usuários: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")

	if len(users) == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Usuário não encontrado",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(users)
}

// GetUser retorna um usuário específico pelo ID
func GetByID(w http.ResponseWriter, r *http.Request) {
	// Obtém o ID da URL
	params := mux.Vars(r)
	userID, err := strconv.ParseUint(params["userId"], 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco de dados: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewUserRepository(db)
	user, err := repo.GetByID(userID)
	if err != nil {
		http.Error(w, "Erro ao buscar usuário: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")

	if user.ID == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Usuário não encontrado",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}
func UpdateUser(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Update User"))
}
func DeleteUser(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Delete User"))
}

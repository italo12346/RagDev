package controllers

import (
	"api/src/auth"
	"api/src/database"
	"api/src/model"
	"api/src/repository"
	"encoding/json"
	"fmt"
	"io"
	"log"
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

	if err := user.Prepare("create"); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewUserRepository(db)
	userID, err := repo.Create(user)
	if err != nil {
		http.Error(w, "Erro ao criar usuário", http.StatusInternalServerError)
		return
	}

	user.ID = userID
	user.Password = ""

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	nameOrNick := r.URL.Query().Get("user")

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewUserRepository(db)
	users, err := repo.GetAll(nameOrNick)
	if err != nil {
		http.Error(w, "Erro ao buscar usuários", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if len(users) == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Nenhum usuário encontrado",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(users)
}

func GetByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	userID, err := strconv.ParseUint(params["userId"], 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewUserRepository(db)
	user, err := repo.GetByID(userID)
	if err != nil {
		http.Error(w, "Erro ao buscar usuário", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

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
	params := mux.Vars(r)
	userID, err := strconv.ParseUint(params["userId"], 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	userIdToken, err := auth.ExtractUserID(r)
	if err != nil {
		http.Error(w, "Token inválido: "+err.Error(), http.StatusUnauthorized)
		return
	}

	if userID != userIdToken {
		http.Error(w, "Sem permissão para atualizar este usuário", http.StatusForbidden)
		return
	}
	fmt.Println(userID, userIdToken)

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Erro ao ler corpo da requisição", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var user model.User
	if err = json.Unmarshal(body, &user); err != nil {
		http.Error(w, "Erro ao converter usuário", http.StatusBadRequest)
		return
	}

	if err = user.Prepare("update"); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewUserRepository(db)
	if err = repo.Update(userID, user); err != nil {
		http.Error(w, "Erro ao atualizar usuário", http.StatusInternalServerError)
		return
	}

	user.ID = userID
	user.Password = ""

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)

	userID, err := strconv.ParseUint(params["userId"], 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	// ID vindo do token
	userIdToken, err := auth.ExtractUserID(r)
	if err != nil {
		http.Error(w, "Token inválido: "+err.Error(), http.StatusUnauthorized)
		return
	}

	// Segurança: usuário só deleta ele mesmo
	if userID != userIdToken {
		http.Error(w, "Sem permissão para deletar este usuário", http.StatusForbidden)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewUserRepository(db)

	if err := repo.Delete(userID); err != nil {
		http.Error(w, "Erro ao deletar usuário", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// Permite que um usuário siga outro
func Follow(w http.ResponseWriter, r *http.Request) {
	followerId, err := auth.ExtractUserID(r)
	if err != nil {
		http.Error(w, "Erro ao obter ID do seguidor", http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	userFollowedID, err := strconv.ParseUint(params["userId"], 10, 64)
	if err != nil {
		log.Print(userFollowedID)
		http.Error(w, "Erro ao obter ID do usuário a ser seguido", http.StatusBadRequest)
		return
	}

	// Impede seguir a si mesmo
	if followerId == userFollowedID {
		http.Error(w, "Você não pode seguir você mesmo", http.StatusForbidden)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewUserRepository(db)
	if err := repo.Follow(followerId, userFollowedID); err != nil {
		http.Error(w, "Erro ao seguir usuário: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Usuario seguido com sucesso"))
}

func Unfollow(w http.ResponseWriter, r *http.Request) {
	followedId, err := auth.ExtractUserID(r)
	if err != nil {
		http.Error(w, "Erro ao obter ID do seguidor", http.StatusUnauthorized)
		return
	}
	params := mux.Vars(r)
	userUnfollowedID, err := strconv.ParseUint(params["userId"], 10, 64)
	if err != nil {
		http.Error(w, "Erro ao obter ID do usuário a ser deixado de seguir", http.StatusBadRequest)
		return
	}
	// Impede deixar de seguir a si mesmo
	if followedId == userUnfollowedID {
		http.Error(w, "Você não pode deixar de seguir você mesmo", http.StatusForbidden)
		return
	}
	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco", http.StatusInternalServerError)
		return
	}
	defer db.Close()
	repository := repository.NewUserRepository(db)
	if err := repository.Unfollow(followedId, userUnfollowedID); err != nil {
		http.Error(w, "Erro ao deixar de seguir usuário: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Usuário deixado de seguir com sucesso",
	})
}

// Retorna os seguidores de um usuário
func GetFollowers(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)

	// valida o ID
	userID, err := strconv.ParseUint(params["userId"], 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewUserRepository(db)

	followers, err := repo.GetFollowers(userID)
	if err != nil {
		http.Error(w, "Erro ao buscar seguidores: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if len(followers) == 0 {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Este usuário não possui seguidores",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(followers)
}

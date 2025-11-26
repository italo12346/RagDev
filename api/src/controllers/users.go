package controllers

import (
	"api/src/auth"
	"api/src/database"
	"api/src/model"
	"api/src/repository"
	"api/src/security"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// Cria um novo usuário
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

// Busca todos os usuários
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

// Busca um usuário pelo ID
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

// Atualiza os dados de um usuário
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

// Deleta um usuário
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

// Permite que um usuário deixe de seguir outro
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

// Retorna os seguidores de um usuário(Quem te segue)
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

// Retorna quem um determinado usuario esta seguindo(Quem você segue)
func GetFollowing(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)

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
	following, err := repo.GetFollowing(userID)
	if err != nil {
		http.Error(w, "Erro ao buscar usuários seguidos: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if len(following) == 0 {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Este usuário não está seguindo ninguém",
		})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(following)
}

// Atualiza a senha do usuário
func UpdatePassword(w http.ResponseWriter, r *http.Request) {
	//  Extrai o ID do token
	userIdToken, err := auth.ExtractUserID(r)
	if err != nil {
		http.Error(w, "Token inválido: "+err.Error(), http.StatusUnauthorized)
		return
	}

	// Extrai o ID da URL
	params := mux.Vars(r)
	userID, err := strconv.ParseUint(params["userId"], 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	//  Valida se o usuário só pode alterar a própria senha
	if userID != userIdToken {
		http.Error(w, "Sem permissão para atualizar a senha deste usuário", http.StatusForbidden)
		return
	}

	// Lê e decodifica o corpo da requisição
	bodyRequest, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Erro ao ler corpo da requisição", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var passwordData model.Password
	if err = json.Unmarshal(bodyRequest, &passwordData); err != nil {
		http.Error(w, "Erro ao converter dados de senha: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Valida se as senhas foram enviadas
	if passwordData.OldPassword == "" || passwordData.NewPassword == "" {
		http.Error(w, "Informe a senha antiga e a nova senha", http.StatusBadRequest)
		return
	}

	//  Conecta ao banco
	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repository := repository.NewUserRepository(db)

	//  Busca senha atual no banco
	currentPassword, err := repository.GetPassword(userID)
	if err != nil {
		http.Error(w, "Erro ao buscar senha atual: "+err.Error(), http.StatusInternalServerError)
		return
	}

	//  Compara a senha atual enviada com o hash
	if err := security.CheckPasswordHash(passwordData.OldPassword, currentPassword); err != nil {
		http.Error(w, "Senha atual incorreta", http.StatusUnauthorized)
		return
	}

	// Gera hash da nova senha
	hashedPassword, err := security.HashPassword(passwordData.NewPassword)
	if err != nil {
		http.Error(w, "Erro ao criptografar senha", http.StatusInternalServerError)
		return
	}
	// Atualiza senha no banco
	if err := repository.UpdatePassword(userID, hashedPassword); err != nil {
		http.Error(w, "Erro ao atualizar senha: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Resposta de sucesso
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Senha atualizada com sucesso!",
	})
}

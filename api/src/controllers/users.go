package controllers

import (
	"api/src/database"
	"api/src/model"
	"api/src/repository"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

func CreateUser(w http.ResponseWriter, r *http.Request) {
	// Garante que o corpo da requisição será fechado no final
	defer r.Body.Close()

	// Lê o corpo da requisição
	bodyRequest, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Não foi possível ler o corpo da requisição", http.StatusBadRequest)
		return
	}

	// Desserializa o JSON recebido
	var user model.User
	if err := json.Unmarshal(bodyRequest, &user); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	// Conecta ao banco de dados
	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco de dados #"+err.Error(), http.StatusInternalServerError)
		return
	}
	repository := repository.NewUserRepository(db)
	repository.Create(user)
	w.Write([]byte(fmt.Sprintf("Usuário criado com sucesso! ID: %d", user.ID)))

	defer db.Close() // sempre fechar o banco ao final
}

func GetUsers(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	//Conecta ao banco de dados

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

package repository

import (
	"api/src/model"
	"database/sql"
	"log"
)

type UserRepository struct {
	db *sql.DB
}

// cria um novo repositório de usuários
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db}
}

// Insere um usuário no banco de dados e retorna o ID do usuário criado
func (u UserRepository) Create(user model.User) (uint64, error) {
	statement, err := u.db.Prepare("insert into users (name, nick, email, password) values (?, ?, ?, ?)")
	if err != nil {
		log.Println("Erro ao preparar a declaração de inserção:", err)
		return 0, err
	}
	defer statement.Close()
	result, err := statement.Exec(user.Name, user.Nick, user.Email, user.Password)
	if err != nil {
		log.Println("Erro ao executar a declaração de inserção:", err)
		return 0, err
	}
	lastInsertId, err := result.LastInsertId()
	if err != nil {
		log.Println("Erro ao obter o ID do último registro inserido:", err)
		return 0, err
	}
	return uint64(lastInsertId), nil
}

func (u UserRepository) GetAll(user model.User) (uint64, error) {
	log.Fatal([]byte("Get all Users"))
	return 0, nil
}

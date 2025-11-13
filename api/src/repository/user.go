package repository

import (
	"api/src/model"
	"database/sql"
	"fmt"
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

// Busca todos os usuários cujo nome ou nick contenham o termo fornecido
func (u UserRepository) GetAll(nameOrNick string) ([]model.User, error) {
	nameOrNick = fmt.Sprintf("%%%s%%", nameOrNick) // adiciona % para busca parcial

	query := "SELECT id, name, nick, email, createdAt FROM users WHERE name LIKE ? OR nick LIKE ?"

	rows, err := u.db.Query(query, nameOrNick, nameOrNick)
	if err != nil {
		log.Println("Erro ao executar a query de seleção:", err)
		return nil, err
	}
	defer rows.Close()

	var users []model.User

	for rows.Next() {
		var user model.User
		if err := rows.Scan(&user.ID, &user.Name, &user.Nick, &user.Email, &user.CreatedAt); err != nil {
			log.Println("Erro ao escanear o usuário:", err)
			return nil, err
		}
		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		log.Println("Erro durante a leitura das linhas:", err)
		return nil, err
	}

	return users, nil
}

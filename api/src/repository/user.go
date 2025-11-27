package repository

import (
	"api/src/model"
	"database/sql"
	"errors"
	"fmt"
	"log"
)

type UserRepository struct {
	db *sql.DB
}

// Cria um novo repositório de usuários
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
func (u UserRepository) GetByID(id uint64) (model.User, error) {
	var user model.User

	query := "SELECT id, name, nick, email, createdAt FROM users WHERE id = ?"

	// Executa a query e escaneia o resultado
	err := u.db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Nick,
		&user.Email,
		&user.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			// Nenhum usuário encontrado
			return user, nil
		}
		log.Println("Erro ao buscar usuário por ID:", err)
		return user, errors.New("erro ao buscar usuário")
	}

	return user, nil
}

// Atualiza um usuário pelo ID
func (u UserRepository) Update(id uint64, user model.User) error {

	// Buscar dados atuais
	var current model.User
	err := u.db.QueryRow(`
        SELECT name, nick, email, password 
        FROM users WHERE id = ?
    `, id).Scan(&current.Name, &current.Nick, &current.Email, &current.Password)

	if err != nil {
		return errors.New("usuário não encontrado")
	}

	// Se não enviaram email → mantém o atual
	if user.Email == "" {
		user.Email = current.Email
	}

	// Se não enviaram senha → mantém a atual
	if user.Password == "" {
		user.Password = current.Password
	}

	query := `
        UPDATE users 
        SET name = ?, nick = ?, email = ?, password = ?
        WHERE id = ?
    `

	_, err = u.db.Exec(query,
		user.Name,
		user.Nick,
		user.Email,
		user.Password,
		id,
	)

	return err
}

// Deleta um usuário pelo ID
func (u UserRepository) Delete(id uint64) error {
	result, err := u.db.Exec("DELETE FROM users WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("erro ao deletar usuário: %w", err)
	}

	// Verifica se algum registro foi realmente apagado
	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("erro ao verificar deleção: %w", err)
	}

	if rows == 0 {
		return errors.New("usuário não encontrado")
	}

	return nil
}

// Busca um usuário pelo email
func (u UserRepository) FindByEmail(email string) (model.User, error) {
	var user model.User

	// Corrigido: agora "password FROM" tem espaço
	query := "SELECT id, email, password FROM users WHERE email = ?"

	err := u.db.QueryRow(query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return user, errors.New("usuário não encontrado")
		}
		return user, fmt.Errorf("erro ao buscar usuário pelo email: %w", err)
	}

	return user, nil
}

// Permite que um usuário siga outro
func (u UserRepository) Follow(followerID, userFollowedID uint64) error {
	go fmt.Print(followerID, userFollowedID)
	// 1 Verifica se o usuário seguido existe
	var exists bool
	err := u.db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE id = ?)", userFollowedID).Scan(&exists)
	if err != nil {
		return err
	}

	if !exists {
		return errors.New("usuário a ser seguido não existe")
	}

	//  Verifica se já segue (evita duplicidade)
	err = u.db.QueryRow(`
        SELECT EXISTS(
            SELECT 1 FROM followers 
            WHERE follows_id = ? AND user_id = ?
        )
    `, followerID, userFollowedID).Scan(&exists)

	if err != nil {
		return err
	}

	if exists {
		return errors.New("você já está seguindo este usuário")
	}

	//  Executa follow
	stmt, err := u.db.Prepare(`
        INSERT INTO followers (follows_id, user_id)
        VALUES (?, ?)
    `)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(followerID, userFollowedID)
	if err != nil {
		return err
	}

	return nil
}

// Permite que um usuário pare de seguir outro
func (u UserRepository) Unfollow(followerID, userUnfollowedID uint64) error {
	stmt, err := u.db.Prepare("DELETE FROM followers WHERE follows_id = ? AND user_id = ?")
	if err != nil {
		return err
	}

	if _, err = stmt.Exec(followerID, userUnfollowedID); err != nil {
		return err
	}
	defer stmt.Close()
	return nil
}

// Retorna os seguidores de um usuário
func (u UserRepository) GetFollowers(userID uint64) ([]model.User, error) {
	rows, err := u.db.Query(`SELECT u.id, u.name, u.nick, u.email, u.createdAt 
		from users u inner join followers s on u.id = s.follows_id where s.user_id = ?`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var followers []model.User
	for rows.Next() {
		var follower model.User
		if err := rows.Scan(&follower.ID, &follower.Name, &follower.Nick, &follower.Email, &follower.CreatedAt); err != nil {
			return nil, err
		}
		followers = append(followers, follower)
	}
	return followers, nil
}

// Retorna quem um determinado usuario esta seguindo
func (u UserRepository) GetFollowing(userID uint64) ([]model.User, error) {
	rows, err := u.db.Query(`
		SELECT u.id, u.name, u.nick, u.email, u.createdAt
		FROM users u
		INNER JOIN followers s ON u.id = s.follows_id
		WHERE s.user_id = ?`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var following []model.User
	for rows.Next() {
		var user model.User
		if err := rows.Scan(&user.ID, &user.Name, &user.Nick, &user.Email, &user.CreatedAt); err != nil {
			return nil, err
		}
		following = append(following, user)
	}

	return following, nil
}

// Retorna a senha do usuário pelo ID
func (u UserRepository) GetPassword(userID uint64) (string, error) {
	var password string

	err := u.db.QueryRow("SELECT password FROM users WHERE id = ?", userID).Scan(&password)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", errors.New("usuário não encontrado")
		}
		return "", err
	}

	return password, nil
}

// Atualiza a senha do usuário
func (u UserRepository) UpdatePassword(userID uint64, newPassword string) error {
	result, err := u.db.Exec("UPDATE users SET password = ? WHERE id = ?", newPassword, userID)
	if err != nil {
		return fmt.Errorf("erro ao atualizar senha: %w", err)
	}

	// Verifica se realmente atualizou
	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("erro ao verificar atualização da senha: %w", err)
	}

	if rows == 0 {
		return errors.New("usuário não encontrado")
	}

	return nil
}

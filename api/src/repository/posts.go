package repository

import (
	"api/src/model"
	"database/sql"
)

type PostsRepository struct {
	db *sql.DB
}

func NewPostsRepository(db *sql.DB) *PostsRepository {
	return &PostsRepository{db}
}

func (r PostsRepository) Create(post model.Post) (uint64, error) {
	result, err := r.db.Exec(
		"INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)",
		post.Title,
		post.Content,
		post.AuthorID,
	)
	if err != nil {
		return 0, err
	}

	postID, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return uint64(postID), nil
}

func (r PostsRepository) GetAll() ([]model.Post, error) {
	rows, err := r.db.Query(`
        SELECT 
            p.id, 
            p.title, 
            p.content, 
            p.author_id,
            u.nick AS author_nickname,
            p.createdAt 
        FROM posts p
        INNER JOIN users u ON u.id = p.author_id
        ORDER BY p.createdAt DESC
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []model.Post

	for rows.Next() {
		var post model.Post
		if err := rows.Scan(
			&post.ID,
			&post.Title,
			&post.Content,
			&post.AuthorID,
			&post.AuthorNickname,
			&post.CreatedAt,
		); err != nil {
			return nil, err
		}

		posts = append(posts, post)
	}

	return posts, nil
}

// Buscar post por ID
func (r PostsRepository) GetByID(postID uint64) (model.Post, error) {
	query := `
        SELECT 
            p.id, 
            p.title, 
            p.content, 
            p.author_id, 
            u.nick AS author_nickname,
            p.createdAt        -- CORRIGIDO
        FROM posts p
        LEFT JOIN users u ON u.id = p.author_id
        WHERE p.id = ?
        LIMIT 1
    `

	row := r.db.QueryRow(query, postID)

	var post model.Post

	err := row.Scan(
		&post.ID,
		&post.Title,
		&post.Content,
		&post.AuthorID,
		&post.AuthorNickname,
		&post.CreatedAt,
	)

	if err != nil {
		return model.Post{}, err
	}

	return post, nil
}

func (r PostsRepository) Update(postID uint64, post model.Post) error {
	return nil
}

// Deletar post
func (r PostsRepository) Delete(postID uint64) error {
	query := "DELETE FROM posts WHERE id = ?"

	_, err := r.db.Exec(query, postID)
	if err != nil {
		return err
	}

	return nil
}

// Dar like
func (r PostsRepository) LikePost(userID, postID uint64) error {
	_, err := r.db.Exec("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", userID, postID)
	return err
}

// Remover like
func (r PostsRepository) UnlikePost(userID, postID uint64) error {
	_, err := r.db.Exec("DELETE FROM likes WHERE user_id = ? AND post_id = ?", userID, postID)
	return err
}

// Contar likes
func (r PostsRepository) CountLikes(postID uint64) (uint64, error) {
	var total uint64
	err := r.db.QueryRow("SELECT COUNT(*) FROM likes WHERE post_id = ?", postID).Scan(&total)
	return total, err
}

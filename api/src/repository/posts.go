package repository

import (
	"api/src/model"
	"database/sql"
	"time"
)

type PostsRepository struct {
	db *sql.DB
}

type CommentsRepository struct {
	db *sql.DB
}

func NewPostsRepository(db *sql.DB) *PostsRepository {
	return &PostsRepository{db}
}
func NewCommentsRepository(db *sql.DB) *CommentsRepository {
	return &CommentsRepository{db}
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

func (r PostsRepository) GetAll(userID uint64) ([]map[string]interface{}, error) {
	rows, err := r.db.Query(`
        SELECT 
            p.id,
            p.title,
            p.content,
            p.author_id,
            u.nick AS author_nickname,
            p.createdAt,
            COUNT(l.post_id) AS likes,
            EXISTS(
                SELECT 1 FROM likes WHERE user_id = ? AND post_id = p.id
            ) AS likedByUser
        FROM posts p
        LEFT JOIN users u ON u.id = p.author_id
        LEFT JOIN likes l ON l.post_id = p.id
        GROUP BY p.id
        ORDER BY p.createdAt DESC
    `, userID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []map[string]interface{}

	for rows.Next() {
		var (
			id             uint64
			title          string
			content        string
			authorId       uint64
			authorNickname string
			createdAt      time.Time
			likes          uint64
			likedByUser    bool
		)

		err := rows.Scan(&id, &title, &content, &authorId, &authorNickname, &createdAt, &likes, &likedByUser)
		if err != nil {
			return nil, err
		}

		post := map[string]interface{}{
			"id":              id,
			"title":           title,
			"content":         content,
			"author_id":       authorId,
			"author_nickname": authorNickname,
			"created_at":      createdAt,
			"likes":           likes,
			"likedByUser":     likedByUser,
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

// Atualiza post
func (r PostsRepository) Update(postID uint64, post model.Post) error {
	statement, err := r.db.Prepare("UPDATE posts SET title = ?, content = ? WHERE id = ?")
	if err != nil {
		return err
	}
	defer statement.Close()
	_, err = statement.Exec(post.Title, post.Content, postID)
	if err != nil {
		return err
	}
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
func (r PostsRepository) GetPostWithLikeInfo(userID, postID uint64) (map[string]interface{}, error) {
	row := r.db.QueryRow(`
        SELECT 
            p.id,
            p.title,
            p.content,
            p.author_id,
            u.nick AS author_nickname,
            p.createdAt,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes,
            EXISTS(
                SELECT 1 FROM likes WHERE user_id = ? AND post_id = p.id
            ) AS likedByUser
        FROM posts p
        LEFT JOIN users u ON u.id = p.author_id
        WHERE p.id = ?
        LIMIT 1
    `, userID, postID)

	var (
		id             uint64
		title          string
		content        string
		authorID       uint64
		authorNickname string
		createdAt      time.Time
		likes          uint64
		likedByUser    bool
	)

	err := row.Scan(&id, &title, &content, &authorID, &authorNickname, &createdAt, &likes, &likedByUser)
	if err != nil {
		return nil, err
	}

	post := map[string]interface{}{
		"id":              id,
		"title":           title,
		"content":         content,
		"author_id":       authorID,
		"author_nickname": authorNickname,
		"created_at":      createdAt,
		"likes":           likes,
		"likedByUser":     likedByUser,
	}

	return post, nil
}

// Criar comentário
func (repo CommentsRepository) Create(comment model.Comment) (uint64, error) {
	query := "INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)"
	result, err := repo.db.Exec(query, comment.PostID, comment.AuthorID, comment.Content)

	if err != nil {
		return 0, err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}

	return uint64(id), nil
}

// Deletar comentário
func (repo CommentsRepository) Delete(commentID uint64) error {
	_, err := repo.db.Exec("DELETE FROM comments WHERE id = ?", commentID)
	return err
}

// Buscar autor do comentário
func (repo CommentsRepository) GetAuthor(commentID uint64) (uint64, error) {
	var authorID uint64
	err := repo.db.QueryRow("SELECT author_id FROM comments WHERE id = ?", commentID).Scan(&authorID)
	return authorID, err
}

// Listar comentários de um post
func (repo CommentsRepository) ListComments(postID uint64) ([]model.CommentResponse, error) {
	rows, err := repo.db.Query(`
        SELECT 
            c.id, c.content, c.createdAt,
            u.id, u.name, u.nick
        FROM comments c
        JOIN users u ON u.id = c.author_id
        WHERE c.post_id = ?
        ORDER BY c.createdAt ASC
    `, postID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []model.CommentResponse

	for rows.Next() {
		var c model.CommentResponse

		err := rows.Scan(
			&c.ID,
			&c.Content,
			&c.CreatedAt,
			&c.Author.ID,
			&c.Author.Name,
			&c.Author.Nick,
		)

		if err != nil {
			return nil, err
		}

		comments = append(comments, c)
	}

	return comments, nil
}

func (repo CommentsRepository) GetByCommentsPostID(postID uint64) ([]model.Comment, error) {
	rows, err := repo.db.Query(`
        SELECT id, post_id, author_id, content, createdAt
        FROM comments
        WHERE post_id = ?
        ORDER BY createdAt DESC
    `, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []model.Comment

	for rows.Next() {
		var comment model.Comment
		if err := rows.Scan(
			&comment.ID,
			&comment.PostID,
			&comment.AuthorID,
			&comment.Content,
			&comment.CreatedAt,
		); err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}

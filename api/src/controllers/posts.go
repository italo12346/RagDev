package controllers

import (
	"api/src/auth"
	"api/src/database"
	"api/src/model"
	"api/src/repository"
	"encoding/json"
	"io"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// Cria Post
func CreatePost(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.ExtractUserID(r)
	if err != nil {
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	bodyRequest, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Erro ao ler body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	var post model.Post
	if err := json.Unmarshal(bodyRequest, &post); err != nil {
		http.Error(w, "Erro ao converter post", http.StatusBadRequest)
		return
	}

	post.AuthorID = userID

	if err = post.Prepare(); err != nil {
		http.Error(w, "Erro ao validar post: "+err.Error(), http.StatusBadRequest)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar DB", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewPostsRepository(db)

	postID, err := repo.Create(post)
	if err != nil {
		http.Error(w, "Erro ao criar post", http.StatusInternalServerError)
		return
	}

	post.ID = postID

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(post)
}

func GetPosts(w http.ResponseWriter, r *http.Request) {
	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar DB", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	userID := r.Context().Value("userID").(uint64)

	repo := repository.NewPostsRepository(db)
	posts, err := repo.GetAll(userID)
	if err != nil {
		http.Error(w, "Erro ao buscar posts", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(posts)
}

// GetPostByID busca um post pelo ID
func GetPostByID(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	postID, err := strconv.ParseUint(params["postId"], 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar DB", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewPostsRepository(db)

	post, err := repo.GetByID(postID)
	if err != nil {
		http.Error(w, "Erro ao buscar post", http.StatusInternalServerError)
		return
	}

	if post.ID == 0 {
		http.Error(w, "Post não encontrado", http.StatusNotFound)
		return
	}

	//  Conta likes
	likes, err := repo.CountLikes(postID)
	if err != nil {
		http.Error(w, "Erro ao contar likes", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"id":              post.ID,
		"title":           post.Title,
		"content":         post.Content,
		"author_id":       post.AuthorID,
		"author_nickname": post.AuthorNickname,
		"created_at":      post.CreatedAt,
		"likes":           likes,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func UpdatePost(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.ExtractUserID(r)
	if err != nil {
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	postID, err := strconv.ParseUint(params["postId"], 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var post model.Post
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		http.Error(w, "Erro no body", http.StatusBadRequest)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar DB", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewPostsRepository(db)

	//valida se o post existe e se pertence ao user
	savedPost, err := repo.GetByID(postID)
	if err != nil {
		http.Error(w, "Erro ao buscar post", http.StatusInternalServerError)
		return
	}

	if savedPost.AuthorID != userID {
		http.Error(w, "Sem permissão para editar este post", http.StatusForbidden)
		return
	}

	if err := repo.Update(postID, post); err != nil {
		http.Error(w, "Erro ao atualizar post", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Post atualizado com sucesso!"})
}

func DeletePost(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.ExtractUserID(r)
	if err != nil {
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	postID, err := strconv.ParseUint(params["postId"], 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar DB", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewPostsRepository(db)

	//valida se o post existe e se pertence ao user
	post, err := repo.GetByID(postID)
	if err != nil {
		http.Error(w, "Erro ao buscar post", http.StatusInternalServerError)
		return
	}

	if post.AuthorID != userID {
		http.Error(w, "Sem permissão para excluir este post", http.StatusForbidden)
		return
	}

	if err := repo.Delete(postID); err != nil {
		http.Error(w, "Erro ao excluir post", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Post removido com sucesso!",
	})
}

func LikePost(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.ExtractUserID(r)
	if err != nil {
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	postID, err := strconv.ParseUint(params["postId"], 10, 64)
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

	repo := repository.NewPostsRepository(db)

	// Tenta inserir like
	if err := repo.LikePost(userID, postID); err != nil {
		http.Error(w, "Você já curtiu este post", http.StatusInternalServerError)
		return
	}

	// Busca post atualizado
	updatedPost, err := repo.GetPostWithLikeInfo(userID, postID)
	if err != nil {
		http.Error(w, "Erro ao buscar post atualizado", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(updatedPost)
}

func UnlikePost(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.ExtractUserID(r)
	if err != nil {
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	postID, err := strconv.ParseUint(params["postId"], 10, 64)
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

	repo := repository.NewPostsRepository(db)

	// Remove like
	if err := repo.UnlikePost(userID, postID); err != nil {
		http.Error(w, "Erro ao remover like", http.StatusInternalServerError)
		return
	}

	// Busca post atualizado
	updatedPost, err := repo.GetPostWithLikeInfo(userID, postID)
	if err != nil {
		http.Error(w, "Erro ao buscar post atualizado", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(updatedPost)
}

func CreateComment(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.ExtractUserID(r)
	if err != nil {
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	postID, err := strconv.ParseUint(params["postId"], 10, 64)
	if err != nil {
		http.Error(w, "ID do post inválido", http.StatusBadRequest)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Erro ao ler corpo da requisição", http.StatusBadRequest)
		return
	}

	var comment model.Comment
	if err := json.Unmarshal(body, &comment); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	if comment.Content == "" {
		http.Error(w, "Comentário vazio", http.StatusBadRequest)
		return
	}

	comment.AuthorID = userID
	comment.PostID = postID

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewCommentsRepository(db)

	commentID, err := repo.Create(comment)
	if err != nil {
		http.Error(w, "Erro ao criar comentário", http.StatusInternalServerError)
		return
	}

	comment.ID = commentID

	json.NewEncoder(w).Encode(comment)
}
func GetCommentsByPost(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	postID, err := strconv.ParseUint(params["postId"], 10, 64)
	if err != nil {
		http.Error(w, "ID do post inválido", http.StatusBadRequest)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar ao banco", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewCommentsRepository(db)
	comments, err := repo.GetByCommentsPostID(postID)
	if err != nil {
		http.Error(w, "Erro ao buscar comentários", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(comments)
}

func DeleteComment(w http.ResponseWriter, r *http.Request) {
	userID, err := auth.ExtractUserID(r)
	if err != nil {
		http.Error(w, "Token inválido", http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	commentID, err := strconv.ParseUint(params["id"], 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	db, err := database.Connect()
	if err != nil {
		http.Error(w, "Erro ao conectar", http.StatusInternalServerError)
		return
	}
	defer db.Close()

	repo := repository.NewCommentsRepository(db)

	authorID, err := repo.GetAuthor(commentID)
	if err != nil {
		http.Error(w, "Erro ao buscar autor", http.StatusBadRequest)
		return
	}

	if authorID != userID {
		http.Error(w, "Não autorizado", http.StatusForbidden)
		return
	}

	if err := repo.Delete(commentID); err != nil {
		http.Error(w, "Erro ao deletar comentário", http.StatusBadRequest)
		return
	}

	json.NewEncoder(w).Encode(map[string]string{
		"message": "Comentário deletado",
	})
}

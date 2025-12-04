package model

type Comment struct {
	ID        uint64 `json:"id"`
	PostID    uint64 `json:"postId"`
	AuthorID  uint64 `json:"authorId"`
	Content   string `json:"content"`
	CreatedAt string `json:"createdAt"`
}

type CommentAuthor struct {
	ID   uint64 `json:"id"`
	Name string `json:"name"`
	Nick string `json:"nick"`
}

type CommentResponse struct {
	ID        uint64        `json:"id"`
	Content   string        `json:"content"`
	CreatedAt string        `json:"createdAt"`
	Author    CommentAuthor `json:"author"`
}

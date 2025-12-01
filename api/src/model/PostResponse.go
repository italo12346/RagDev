package model

import "time"

type PostResponse struct {
	ID             uint64    `json:"id"`
	Title          string    `json:"title"`
	Content        string    `json:"content"`
	AuthorID       uint64    `json:"author_id"`
	AuthorNickname string    `json:"author_nickname"`
	AuthorPhotoURL *string   `json:"author_photo_url,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	Likes          uint64    `json:"likes"`
	LikedByMe      bool      `json:"likedByMe"`
}

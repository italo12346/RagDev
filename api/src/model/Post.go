package model

import "time"

type Post struct {
	ID             uint64    `gorm:"primaryKey" json:"id,omitempty"`
	Title          string    `json:"title,omitempty"`
	Content        string    `json:"content,omitempty"`
	AuthorID       uint64    `json:"author_id,omitempty"`
	AuthorNickname string    `json:"author_nickname,omitempty"`
	CreatedAt      time.Time `json:"created_at,omitempty"`
}

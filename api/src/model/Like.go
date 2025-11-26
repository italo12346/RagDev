package model

import "time"

type Like struct {
	UserID    uint64    `json:"user_id"`
	PostID    uint64    `json:"post_id"`
	CreatedAt time.Time `json:"created_at"`
}

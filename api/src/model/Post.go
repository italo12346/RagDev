package model

import (
	"errors"
	"strings"
	"time"
)

type Post struct {
	ID             uint64    `gorm:"primaryKey" json:"id,omitempty"`
	Title          string    `json:"title,omitempty"`
	Content        string    `json:"content,omitempty"`
	AuthorID       uint64    `json:"author_id,omitempty"`
	AuthorNickname string    `json:"author_nickname,omitempty"`
	CreatedAt      time.Time `json:"created_at,omitempty"`
}

// Prepare valida e formata os dados do post
func (p *Post) Prepare() error {
	if err := p.validate(); err != nil {
		return err
	}

	p.format()
	return nil
}

func (p *Post) validate() error {
	if p.Title == "" {
		return errors.New("o titulo é obrigatório")
	}
	if p.Content == "" {
		return errors.New("o conteúdo é obrigatório")
	}
	if p.AuthorID == 0 {
		return errors.New("o ID do autor é obrigatório")
	}
	return nil
}
func (p *Post) format() {
	p.Title = strings.TrimSpace(p.Title)
	p.Content = strings.TrimSpace(p.Content)
}

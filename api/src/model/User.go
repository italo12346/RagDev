package model

type User struct {
	ID        uint64 `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Nick      string `json:"nick"`
	Password  string `json:"password,omitempty"`
	CreatedAt string `json:"createdAt"`
}

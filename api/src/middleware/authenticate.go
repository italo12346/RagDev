package middleware

import (
	"api/src/auth"
	"fmt"
	"net/http"
)

func Logger(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("Requisição recebida: %s %s\n", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
	}
}

// Authenticate é um middleware que verifica se o usuário está autenticado
func Authenticate(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if err := auth.TokenValidate(r); err != nil {
			http.Error(w, "Acesso não autorizado", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	}
}

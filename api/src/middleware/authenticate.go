package middleware

import (
	"api/src/auth"
	"context"
	"net/http"
)

func Authenticate(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Verifica se o token é válido
		if err := auth.TokenValidate(r); err != nil {
			http.Error(w, "Acesso não autorizado", http.StatusUnauthorized)
			return
		}

		// Extrai o ID do usuário do token
		userID, err := auth.ExtractUserID(r)
		if err != nil {
			http.Error(w, "Erro ao identificar usuário", http.StatusUnauthorized)
			return
		}

		// Coloca no contexto
		ctx := context.WithValue(r.Context(), "userID", userID)

		// Continua com a requisição
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

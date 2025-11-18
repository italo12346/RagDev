package auth

import (
	"api/src/config"
	"errors"
	"net/http"
	"strings"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
)

// Gerar Token
func TokenGenerator(userID uint64) (string, error) {

	claims := jwt.MapClaims{
		"authorized": true,
		"user_id":    userID,
		"exp":        jwt.NewNumericDate(time.Now().Add(6 * time.Hour)),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.JWTSecret))
}

// Extrair token do header
func extractToken(r *http.Request) string {
	bearer := r.Header.Get("Authorization")

	if bearer == "" {
		return ""
	}

	parts := strings.Fields(bearer) // divide por qualquer espaço
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return ""
	}

	return parts[1]
}

// Valida o token
func TokenValidate(r *http.Request) error {
	_, err := parseToken(r)
	return err
}

// parseToken retorna o token já validado
func parseToken(r *http.Request) (*jwt.Token, error) {
	tokenStr := extractToken(r)
	if tokenStr == "" {
		return nil, errors.New("token não encontrado")
	}

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {

		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("método de assinatura inválido")
		}

		return []byte(config.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("token inválido")
	}

	return token, nil
}

// Extrai userID com segurança
func ExtractUserID(r *http.Request) (uint64, error) {
	token, err := parseToken(r)
	if err != nil {
		return 0, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("não foi possível ler as claims")
	}

	// Convertendo seguro
	switch v := claims["user_id"].(type) {
	case float64:
		return uint64(v), nil
	case int:
		return uint64(v), nil
	case uint64:
		return v, nil
	default:
		return 0, errors.New("user_id inválido no token")
	}
}

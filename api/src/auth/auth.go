package auth

import (
	"api/src/config"
	"time"

	jwt "github.com/golang-jwt/jwt/v5"
)

func TokenGenerator(userID uint64) (string, error) {
	permissions := jwt.MapClaims{}
	permissions["authorized"] = true
	permissions["user_id"] = userID
	// Expiração do token em 6 horas
	permissions["exp"] = jwt.NewNumericDate(time.Now().Add(6 * time.Hour))
	jwtKey := jwt.NewWithClaims(jwt.SigningMethodHS256, permissions)
	return jwtKey.SignedString([]byte(config.JWTSecret))
}

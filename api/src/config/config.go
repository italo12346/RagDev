// Inicia as Variáveis de Ambiente
package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

var (
	DBUser     string
	DBPassword string
	DBName     string
	APIPort    string
	JWTSecret  string
)

func LoadEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Aviso: arquivo .env não encontrado, usando variáveis de ambiente do sistema.")
	}

	DBUser = os.Getenv("DB_USER")
	DBPassword = os.Getenv("DB_PASSWORD")
	DBName = os.Getenv("DB_NAME")
	APIPort = os.Getenv("API_PORT")
	JWTSecret = os.Getenv("JWT_SECRET")

	// Apenas confirma que as variáveis foram carregadas — sem mostrar senhas ou strings
	if DBUser == "" || DBPassword == "" || DBName == "" {
		log.Println("⚠️  Algumas variáveis de ambiente do banco de dados não foram definidas.")
	} else {
		log.Println("✅ Variáveis de ambiente do banco de dados carregadas com sucesso.")
	}

	if APIPort == "" {
		log.Println("⚠️  Porta da API não definida (API_PORT).")
	}

	if JWTSecret == "" {
		log.Println("⚠️  Segredo JWT não definido (JWT_SECRET).")
	}

}

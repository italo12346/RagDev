package database

import (
	"api/src/config"
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func Connect() (*sql.DB, error) {
	dsn := config.DBUser + ":" + config.DBPassword + "@/" + config.DBName + "?charset=utf8&parseTime=True&loc=Local"

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}

	// Testa a conexão com o banco
	if pingErr := db.Ping(); pingErr != nil {
		db.Close()
		return nil, pingErr
	}

	log.Println("✅ Conexão com o banco de dados estabelecida com sucesso.")
	return db, nil
}

package main

import (
	"api/src/config"
	"api/src/middleware"
	"api/src/router"
	"fmt"
	"log"
	"net/http"
)

func main() {
	config.LoadEnv()

	r := router.Generate()

	handler := middleware.EnableCORS(r)

	fmt.Printf("Rodando api na porta %s\n", config.APIPort)
	log.Fatal(http.ListenAndServe(":"+config.APIPort, handler))
}

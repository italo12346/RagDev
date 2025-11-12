package routes

import (
	"net/http"

	"github.com/gorilla/mux"
)

// Rota representa as rotas da API
type Route struct {
	Uri            string
	Method         string
	Function       func(w http.ResponseWriter, r *http.Request)
	Authentication bool
}

// SettingRoutes adiciona todas as rotas ao roteador fornecido
func SettingRoutes(router *mux.Router) *mux.Router {
	routes := routeUsers
	for _, route := range routes {
		router.HandleFunc(route.Uri, route.Function).Methods(route.Method)
	}
	return router
}

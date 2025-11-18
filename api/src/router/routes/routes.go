package routes

import (
	"api/src/middleware"
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
	routes = append(routes, routeLogin)
	for _, route := range routes {
		if route.Authentication {
			router.HandleFunc(route.Uri, middleware.Logger(middleware.Authenticate(route.Function))).Methods(route.Method)
		} else {
			router.HandleFunc(route.Uri, middleware.Logger(route.Function)).Methods(route.Method)
		}
	}
	return router
}

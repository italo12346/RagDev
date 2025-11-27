package router

import (
	"api/src/middleware"
	"api/src/router/routes"

	"github.com/gorilla/mux"
)

func Generate() *mux.Router {
	r := mux.NewRouter()
	r.Use(middleware.EnableCORS)
	return routes.SettingRoutes(r)
}

package routes

import (
	"api/src/controllers"
	"net/http"
)

var routeLogin = Route{
	Uri:            "/login",
	Methods:        []string{http.MethodPost, http.MethodOptions},
	Function:       controllers.Login,
	Authentication: false,
}

package routes

import (
	"api/src/controllers"
	"net/http"
)

var routeUsers = []Route{
	{
		Uri:            "/users",
		Method:         http.MethodPost,
		Function:       controllers.CreateUser,
		Authentication: false,
	},
	{
		Uri:            "/users",
		Method:         http.MethodGet,
		Function:       controllers.GetUsers,
		Authentication: false,
	},
	{
		Uri:            "/users/{userId}",
		Method:         http.MethodGet,
		Function:       controllers.GetByID,
		Authentication: false,
	},
	{
		Uri:            "/users/{userId}",
		Method:         http.MethodPut,
		Function:       controllers.UpdateUser,
		Authentication: false,
	},
	{
		Uri:            "/users/{userId}",
		Method:         http.MethodDelete,
		Function:       controllers.DeleteUser,
		Authentication: false,
	},
}

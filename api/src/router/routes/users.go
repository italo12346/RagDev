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
		Authentication: true,
	},
	{
		Uri:            "/users/{userId}",
		Method:         http.MethodGet,
		Function:       controllers.GetByID,
		Authentication: true,
	},
	{
		Uri:            "/users/{userId}",
		Method:         http.MethodPut,
		Function:       controllers.UpdateUser,
		Authentication: true,
	},
	{
		Uri:            "/users/{userId}",
		Method:         http.MethodDelete,
		Function:       controllers.DeleteUser,
		Authentication: true,
	},
	// Seguidor
	{
		Uri:            "/user/{userId}/userFollowed",
		Method:         http.MethodPost,
		Function:       controllers.Follow,
		Authentication: true,
	},
	{
		Uri:            "/user/{userId}/unfollowed",
		Method:         http.MethodPost,
		Function:       controllers.Unfollow,
		Authentication: true,
	},
	{
		Uri:            "/user/{userId}/followers",
		Method:         http.MethodGet,
		Function:       controllers.GetFollowers,
		Authentication: true,
	},
}

package routes

import (
	"api/src/controllers"
	"net/http"
)

var routeUsers = []Route{
	{
		Uri:            "/users",
		Methods:        []string{http.MethodPost, http.MethodOptions},
		Function:       controllers.CreateUser,
		Authentication: false,
	},
	{
		Uri:            "/users",
		Methods:        []string{http.MethodGet, http.MethodOptions},
		Function:       controllers.GetUsers,
		Authentication: true,
	},
	{
		Uri:            "/users/{userId}",
		Methods:        []string{http.MethodGet, http.MethodOptions},
		Function:       controllers.GetByID,
		Authentication: true,
	},
	{
		Uri:            "/users/{userId}",
		Methods:        []string{http.MethodPut, http.MethodOptions},
		Function:       controllers.UpdateUser,
		Authentication: true,
	},
	{
		Uri:            "/users/{userId}",
		Methods:        []string{http.MethodDelete, http.MethodOptions},
		Function:       controllers.DeleteUser,
		Authentication: true,
	},

	// SEGUIDORES
	{
		Uri:            "/user/{userId}/userFollowed",
		Methods:        []string{http.MethodPost, http.MethodOptions},
		Function:       controllers.Follow,
		Authentication: true,
	},
	{
		Uri:            "/user/{userId}/unfollowed",
		Methods:        []string{http.MethodPost, http.MethodOptions},
		Function:       controllers.Unfollow,
		Authentication: true,
	},
	{
		Uri:            "/user/{userId}/followers",
		Methods:        []string{http.MethodGet, http.MethodOptions},
		Function:       controllers.GetFollowers,
		Authentication: true,
	},
	{
		Uri:            "/user/{userId}/following",
		Methods:        []string{http.MethodGet, http.MethodOptions},
		Function:       controllers.GetFollowing,
		Authentication: true,
	},
	{
		Uri:            "/user/{userId}/password-update",
		Methods:        []string{http.MethodPost, http.MethodOptions},
		Function:       controllers.UpdatePassword,
		Authentication: true,
	},
}

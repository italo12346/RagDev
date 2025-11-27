package routes

import (
	"api/src/controllers"
	"net/http"
)

var routesPost = []Route{
	{
		Uri:            "/posts",
		Methods:        []string{http.MethodPost, http.MethodOptions},
		Function:       controllers.CreatePost,
		Authentication: true,
	},
	{
		Uri:            "/posts",
		Methods:        []string{http.MethodGet, http.MethodOptions},
		Function:       controllers.GetPosts,
		Authentication: true,
	},
	{
		Uri:            "/posts/{postId}",
		Methods:        []string{http.MethodGet, http.MethodOptions},
		Function:       controllers.GetPostByID,
		Authentication: true,
	},
	{
		Uri:            "/posts/{postId}",
		Methods:        []string{http.MethodPut, http.MethodOptions},
		Function:       controllers.UpdatePost,
		Authentication: true,
	},
	{
		Uri:            "/posts/{postId}",
		Methods:        []string{http.MethodDelete, http.MethodOptions},
		Function:       controllers.DeletePost,
		Authentication: true,
	},
	{
		Uri:            "/posts/{postId}/like",
		Methods:        []string{http.MethodPost, http.MethodOptions},
		Function:       controllers.LikePost,
		Authentication: true,
	},
	{
		Uri:            "/posts/{postId}/unlike",
		Methods:        []string{http.MethodDelete, http.MethodOptions},
		Function:       controllers.UnlikePost,
		Authentication: true,
	},
}

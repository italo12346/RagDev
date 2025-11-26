package routes

import (
	"api/src/controllers"
	"net/http"
)

var routesPost = []Route{
	{
		Uri:            "/posts",
		Method:         http.MethodPost,
		Function:       controllers.CreatePost,
		Authentication: true,
	},
	{
		Uri:            "/posts",
		Method:         http.MethodGet,
		Function:       controllers.GetPosts,
		Authentication: true,
	},
	{
		Uri:            "/posts/{postId}",
		Method:         http.MethodGet,
		Function:       controllers.GetPostByID,
		Authentication: true,
	},
	// {
	// 	Uri:            "/posts/{postId}",
	// 	Method:         http.MethodPut,
	// 	Function:       controllers.UpdatePost,
	// 	Authentication: true,
	// },
	{
		Uri:            "/posts/{postId}",
		Method:         http.MethodDelete,
		Function:       controllers.DeletePost,
		Authentication: true,
	},
	{
		Uri:            "/posts/{postId}/like",
		Method:         http.MethodPost,
		Function:       controllers.LikePost,
		Authentication: true,
	},
	{
		Uri:            "/posts/{postId}/unlike",
		Method:         http.MethodDelete,
		Function:       controllers.UnlikePost,
		Authentication: true,
	},
}

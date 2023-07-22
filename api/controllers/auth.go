package controllers

import (
	"net/http"

	"github.com/frederick-gomez/go-api/models"
	"github.com/gin-gonic/gin"
)

// @Summary			Returns all users in db
// @Tags				Auth
// @Accept			json
// @Produce			json
// @Success			200	{array}	models.User
// @Security 		ApiKeyAuth
// @Router			/auth/users [get]
func GetUsers(ctx *gin.Context) {
	var users []models.User
	result := models.DB.Find(&users)
	if result.Error != nil {
		ctx.IndentedJSON(
			http.StatusInternalServerError,
			gin.H{"error": result.Error},
		)
	}
	ctx.IndentedJSON(http.StatusOK, users)
}

// @Summary			Login the user
// @Tags				Auth
// @Accept			json
// @Produce			json
// @Param				Body body models.LoginReq true " "
// @Success			200	{object}	models.User
// @Router			/auth/login [post]
// @Security 		ApiKeyAuth
func Login(ctx *gin.Context) {
	body := models.LoginReq{}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// result := models.DB.Find(&users)
	// 	ctx.IndentedJSON(
	// 		http.StatusInternalServerError,
	// 		gin.H{"error": result.Error},
	// 	)
	// }

}

// @Summary			Create new user
// @Tags				Auth
// @Accept			json
// @Produce			json
// @Param				Body body models.LoginReq true " "
// @Success			201	{string} string	"ok"
// @Router			/auth/new-user [post]
// @Security 		ApiKeyAuth
func CreateUser(ctx *gin.Context) {
	body := models.LoginReq{}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.IndentedJSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// result := models.DB.Find(&users)
	// 	ctx.IndentedJSON(
	// 		http.StatusInternalServerError,
	// 		gin.H{"error": result.Error},
	// 	)
	// }

}

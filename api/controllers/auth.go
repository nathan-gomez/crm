package controllers

import (
	"errors"
	"net/http"

	"github.com/frederick-gomez/go-api/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

//TODO: Fix timestamp return

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
		ctx.AbortWithStatusJSON(
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

	var loginUser models.User
	if result := models.DB.First(&loginUser, models.User{Name: body.User}); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			ctx.AbortWithStatus(http.StatusNoContent)
		}

		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			gin.H{"error": result.Error},
		)
	}

	ctx.IndentedJSON(http.StatusOK, loginUser)
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

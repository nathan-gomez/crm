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
// @Failure			400	{object} models.ErrorResponse	" "
// @Failure			500	{object} models.ErrorResponse	" "
// @Security 		ApiKeyAuth
// @Router			/auth/users [get]
func GetUsers(ctx *gin.Context) {
	var users []models.User
	result := models.DB.Find(&users)
	if result.Error != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: result.Error.Error()},
		)
		return
	}

	ctx.IndentedJSON(http.StatusOK, users)
}

// @Summary			Login the user
// @Tags				Auth
// @Accept			json
// @Produce			json
// @Param				Body body models.LoginRequest true " "
// @Success			200	{object}	models.User
// @Failure			400	{object} models.ErrorResponse	" "
// @Failure			500	{object} models.ErrorResponse	" "
// @Router			/auth/login [post]
// @Security 		ApiKeyAuth
func Login(ctx *gin.Context) {
	body := models.LoginRequest{}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	var loginUser models.User
	if result := models.DB.First(&loginUser, models.User{Name: body.Name}); result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			ctx.AbortWithStatus(http.StatusNoContent)
			return
		}

		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: result.Error.Error()},
		)
		return
	}

	ctx.IndentedJSON(http.StatusOK, loginUser)
}

// @Summary			Create new user
// @Tags				Auth
// @Accept			json
// @Produce			json
// @Param				Body body models.RegisterRequest true " "
// @Success			201	{object} models.OkResponse	"OK"
// @Failure			400	{object} models.ErrorResponse	" "
// @Failure			500	{object} models.ErrorResponse	" "
// @Router			/auth/create-user [post]
// @Security 		ApiKeyAuth
func CreateUser(ctx *gin.Context) {
	body := models.RegisterRequest{}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	result := models.DB.Table("users").Create(&body)

	if result.Error != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: result.Error.Error()},
		)
		return
	}

	ctx.IndentedJSON(http.StatusCreated, &models.OkResponse{Message: "OK"})
}

// @Summary			Check availability of username
// @Tags				Auth
// @Accept			json
// @Produce			json
// @Param				Body body models.LoginRequest true " "
// @Success			200	{string} string	"OK"
// @Failure			400	{object} models.ErrorResponse	" "
// @Failure			500	{object} models.ErrorResponse	" "
// @Router			/auth/check-user [post]
// @Security 		ApiKeyAuth
func CheckUsername(ctx *gin.Context) {
	body := struct {
		Name string `json:"name"`
	}{}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	var counter int64
	if result := models.DB.Table("users").Where("name = ?", body.Name).Count(&counter); result.Error != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: result.Error.Error()},
		)
		return
	}

	if counter > 0 {
		ctx.IndentedJSON(http.StatusOK, &models.OkResponse{Message: "Username taken"})
	} else {
		ctx.IndentedJSON(http.StatusOK, &models.OkResponse{Message: "Username available"})
	}

}

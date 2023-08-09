package controllers

import (
	"errors"
	"net/http"

	"github.com/frederick-gomez/go-api/models"
	"github.com/frederick-gomez/go-api/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// @Summary	Login the user
// @Tags		Auth
// @Accept		json
// @Produce	json
// @Param		Body	body		models.LoginRequest	true	" "
// @Success	200		{object}	models.User
// @Failure	401		{object}	models.ErrorResponse	" "
// @Failure	400		{object}	models.ErrorResponse	" "
// @Failure	500		{object}	models.ErrorResponse	" "
// @Router		/auth/login [post]
// @Security	ApiKeyAuth
func Login(ctx *gin.Context) {
	body := models.LoginRequest{}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	var loginUser models.User
	if result := utils.DB.First(&loginUser, models.User{Username: body.Username}); result.Error != nil {
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

	if hashErr := bcrypt.CompareHashAndPassword([]byte(loginUser.Password), []byte(body.Password)); hashErr != nil {
		ctx.AbortWithStatusJSON(
			http.StatusUnauthorized,
			&models.ErrorResponse{Error: "Invalid password"},
		)
		return
	}

	session := &models.Session{
		Id:       uuid.New().String(),
		Username: loginUser.Username,
	}

	if result := utils.DB.Table("sessions").Create(&session); result.Error != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: result.Error.Error()},
		)
		return
	}

	ctx.SetCookie("session_token", session.Id, 3600, "/login", "localhost", false, true)
	ctx.IndentedJSON(http.StatusOK, gin.H{"id": loginUser.Id, "role": loginUser.Role, "name": loginUser.Username})
}

// @Summary	Logout current session
// @Tags		Auth
// @Accept		json
// @Produce	json
// @Param		Body	body		controllers.Logout.request	true	" "
// @Success	200		{object}	models.OkResponse		"OK"
// @Failure	400		{object}	models.ErrorResponse	" "
// @Failure	500		{object}	models.ErrorResponse	" "
// @Router		/auth/logout [post]
// @Security	ApiKeyAuth
func Logout(ctx *gin.Context) {
	type request struct {
		Userame string `json:"username" binding:"required"`
	}

	body := request{}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	cookie, err := ctx.Cookie("session_token")
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	result := utils.DB.Table("sessions").Where("username = ?", body.Userame).Delete(&models.Session{Id: cookie})
	if result.Error != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: result.Error.Error()},
		)
		return
	}

	ctx.IndentedJSON(http.StatusOK, &models.OkResponse{Message: "OK"})
}

// @Summary	Create new user
// @Tags		Auth
// @Accept		json
// @Produce	json
// @Param		Body	body		models.RegisterRequest	true	" "
// @Success	201		{object}	models.OkResponse		"OK"
// @Failure	400		{object}	models.ErrorResponse	" "
// @Failure	500		{object}	models.ErrorResponse	" "
// @Router		/auth/create-user [post]
// @Security	ApiKeyAuth
func CreateUser(ctx *gin.Context) {
	body := models.RegisterRequest{}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	result := utils.DB.Table("users").Create(&body)

	if result.Error != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: result.Error.Error()},
		)
		return
	}

	ctx.IndentedJSON(http.StatusCreated, &models.OkResponse{Message: "OK"})
}

// @Summary	Check availability of username
// @Tags		Auth
// @Accept		json
// @Produce	json
// @Param		Body	body		controllers.CheckUsername.request		true	" "
// @Success	200		{string}	string					"OK"
// @Failure	400		{object}	models.ErrorResponse	" "
// @Failure	500		{object}	models.ErrorResponse	" "
// @Router		/auth/check-user [post]
// @Security	ApiKeyAuth
func CheckUsername(ctx *gin.Context) {
	type request struct {
		Userame string `json:"username" binding:"required"`
	}

	body := request{}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	var counter int64
	if result := utils.DB.Table("users").Where("name = ?", body.Userame).Count(&counter); result.Error != nil {
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

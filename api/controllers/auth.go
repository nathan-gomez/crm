package controllers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/frederick-gomez/go-api/models"
	"github.com/frederick-gomez/go-api/utils"
)

// @Summary	Login the user
// @Tags		Auth
// @Accept	json
// @Produce	json
// @Param		Body	body		models.LoginRequest	true	" "
// @Success	200		{object}	models.User
// @Failure	401		{object}	models.ErrorResponse	" "
// @Failure	400		{object}	models.ErrorResponse	" "
// @Failure	500		{object}	models.ErrorResponse	" "
// @Router		/auth/login [post]
func Login(ctx *gin.Context) {
	var err error
	body := models.LoginRequest{}

	if err = ctx.ShouldBindJSON(&body); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	conn := utils.GetConn(ctx)
	defer conn.Release()

	loginUser := &models.User{}
	sql := "SELECT username, password, role FROM users where username = $1;"
	err = conn.QueryRow(context.Background(), sql, body.Username).Scan(&loginUser.Username, &loginUser.Password, &loginUser.Role)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			ctx.AbortWithStatus(http.StatusNoContent)
			return
		}
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, &models.ErrorResponse{Error: err.Error()})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(loginUser.Password), []byte(body.Password))
	if err != nil {
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

	sql = "insert into sessions (id, username) values (@sessionId, @username);"
	args := &pgx.NamedArgs{"sessionId": session.Id, "username": session.Username}
	_, err = conn.Exec(context.Background(), sql, args)
	if err != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: err.Error()},
		)
		return
	}

	encryptedSessionId, err := utils.EncryptValue(session.Id)
	if err != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: err.Error()},
		)
		return
	}

  loginUser.Password = ""
	ctx.SetCookie("session_token", encryptedSessionId, 3600, "/", "", false, true)
	ctx.IndentedJSON(http.StatusOK, &loginUser)
}

// @Summary	Logout current session
// @Tags		Auth
// @Accept	json
// @Produce	json
// @Param		Body	body		controllers.Logout.request	true	" "
// @Success	200		{object}	models.OkResponse		"OK"
// @Failure	400		{object}	models.ErrorResponse	" "
// @Failure	500		{object}	models.ErrorResponse	" "
// @Router		/auth/logout [post]
func Logout(ctx *gin.Context) {
	type request struct {
		Username string `json:"username" binding:"required"`
	}

	body := &request{}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	token := ctx.GetString("session_token")

	result := utils.DB.Table("sessions").Delete(&models.Session{Id: token, Username: body.Username})
	if result.Error != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: result.Error.Error()},
		)
		return
	}

	ctx.SetCookie("session_token", "", -1, "/", "", false, true)
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
func CreateUser(ctx *gin.Context) {
	body := &models.RegisterRequest{}

	if err := ctx.ShouldBindJSON(&body); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	var counter int64
	if result := utils.DB.Table("users").Where("username = ?", body.Username).Count(&counter); result.Error != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: result.Error.Error()},
		)
		return
	}

	if counter > 0 {
		ctx.IndentedJSON(http.StatusOK, &models.OkResponse{Message: "Username taken"})
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

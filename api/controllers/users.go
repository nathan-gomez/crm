package controllers

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/bcrypt"

	"github.com/frederick-gomez/go-api/models"
	"github.com/frederick-gomez/go-api/utils"
)

// @Summary	Login the user
// @Tags		Users
// @Accept	json
// @Produce	json
// @Param		Body	body  		models.LoginRequest	true	" "
// @Success	200		{object}	models.User
// @Failure	401		{object}	models.ErrorResponse	" "
// @Failure	400		{object}	models.ErrorResponse	" "
// @Failure	500		{object}	models.ErrorResponse	" "
// @Router	/users/login [post]
func Login(ctx *gin.Context) {
	var err error
	var sql string
	var args pgx.NamedArgs
	req := models.LoginRequest{}

	if err = ctx.ShouldBindJSON(&req); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	conn := utils.GetConn(ctx)
	defer conn.Release()

	loginUser := &models.User{}

	sql = "SELECT id, username, password, role FROM users where username = @username;"
	args = pgx.NamedArgs{"username": req.Username}
	err = conn.QueryRow(context.Background(), sql, args).Scan(&loginUser.Id, &loginUser.Username, &loginUser.Password, &loginUser.Role)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			ctx.AbortWithStatus(http.StatusNoContent)
			return
		}
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, &models.ErrorResponse{Error: err.Error()})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(loginUser.Password), []byte(req.Password))
	if err != nil {
		ctx.AbortWithStatusJSON(
			http.StatusUnauthorized,
			&models.ErrorResponse{Error: "Invalid password"},
		)
		return
	}

	expiration := time.Now().Add(1 * time.Hour)
	session := &models.Session{Id: uuid.New().String(), Expiration: &expiration}

	sql = "insert into sessions (id, user_id, expiration) values (@sessionId, @userId, @expiration);"
	args = pgx.NamedArgs{"sessionId": session.Id, "userId": loginUser.Id, "expiration": session.Expiration}
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
	loginUser.Id = ""
	ctx.SetCookie("session_token", encryptedSessionId, 0, "/", "", false, true)
	ctx.IndentedJSON(http.StatusOK, &loginUser)
}

// @Summary	Logout current session
// @Tags		Users
// @Accept	json
// @Produce	json
// @Success	200		{object}	models.OkResponse		"OK"
// @Failure	400		{object}	models.ErrorResponse	" "
// @Failure	500		{object}	models.ErrorResponse	" "
// @Router	/users/logout [get]
func Logout(ctx *gin.Context) {
	var err error

	conn := utils.GetConn(ctx)
	defer conn.Release()

	token := ctx.GetString("session_token")

	sql := "delete from sessions where id = @sessionId;"
	args := &pgx.NamedArgs{"sessionId": &token}
	_, err = conn.Exec(context.Background(), sql, args)
	if err != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: err.Error()},
		)
		return
	}

	ctx.SetCookie("session_token", "", -1, "/", "", false, true)
	ctx.IndentedJSON(http.StatusOK, &models.OkResponse{Message: "OK"})
}

// @Summary	Create new user
// @Tags		Users
// @Accept	json
// @Produce	json
// @Param		Body	body		  models.RegisterRequest	true	" "
// @Success	201		{object}	models.OkResponse		"OK"
// @Failure	400		{object}	models.ErrorResponse	" "
// @Failure	500		{object}	models.ErrorResponse	" "
// @Router	/users/create-user [post]
func CreateUser(ctx *gin.Context) {
	var err error
	var sql string
	var args pgx.NamedArgs
	req := &models.RegisterRequest{}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	conn := utils.GetConn(ctx)
	defer conn.Release()

	currentUser := &models.User{Id: ctx.GetString("user_id")}

	sql = "select role from users where id = @userId"
	args = pgx.NamedArgs{"userId": &currentUser.Id}
	err = conn.QueryRow(context.Background(), sql, args).Scan(&currentUser.Role)
	if err != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: err.Error()},
		)
		return
	}

	if currentUser.Role != models.Admin {
		ctx.AbortWithStatus(http.StatusForbidden)
		return
	}

	var counter int64

	sql = "select count(1) from users where username = @username"
	args = pgx.NamedArgs{"username": req.Username}
	err = conn.QueryRow(context.Background(), sql, args).Scan(&counter)
	if err != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: err.Error()},
		)
		return
	}

	if counter > 0 {
		ctx.IndentedJSON(http.StatusOK, &models.OkResponse{Message: "Username taken"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(([]byte(req.Password)), 8)
	if err != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: err.Error()},
		)
		return
	}
	req.Password = string(hashedPassword)

	sql = "insert into users (username, password, role) values (@username, @password, @role);"
	args = pgx.NamedArgs{"username": req.Username, "password": req.Password, "role": req.Role}
	_, err = conn.Exec(context.Background(), sql, args)
	if err != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: err.Error()},
		)
		return
	}

	ctx.IndentedJSON(http.StatusCreated, &models.OkResponse{Message: "OK"})
}

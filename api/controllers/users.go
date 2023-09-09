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
// @Success	200		{object}	models.OkResponse "OK"
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

	sql = "SELECT id, password FROM users where username = @username;"
	args = pgx.NamedArgs{"username": req.Username}
	err = conn.QueryRow(context.Background(), sql, args).Scan(&loginUser.Id, &loginUser.Password)
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

	ctx.SetCookie("session_token", encryptedSessionId, int((1 * time.Hour).Seconds()), "/", "", false, true)
	ctx.IndentedJSON(http.StatusOK, &models.OkResponse{Message: "OK"})
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

// @Summary	Gets data of current user
// @Tags	    Users
// @Accept    json
// @Produce   json
// @Success   200		{object}	models.User		"OK"
// @Failure   500		{object}	models.ErrorResponse	" "
// @Security	ApiKeyAuth
// @Param		  x-api-key 	    header	string	true	"ApiKey header"
// @Router	  /users/user-data [get]
func UserData(ctx *gin.Context) {
	var err error
	var sql string
	var args pgx.NamedArgs

	conn := utils.GetConn(ctx)
	defer conn.Release()

	currentUser := &models.User{}
	sessionId := ctx.GetString("session_token")

	sql = "SELECT b.username, b.role FROM sessions a left join users b on a.user_id = b.id where a.id = @sessionId;"
	args = pgx.NamedArgs{"sessionId": sessionId}
	err = conn.QueryRow(context.Background(), sql, args).Scan(&currentUser.Username, &currentUser.Role)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, &models.ErrorResponse{Error: err.Error()})
		return
	}

	ctx.IndentedJSON(http.StatusOK, &currentUser)
}

// @Summary	Return the roles available
// @Tags	    Users
// @Accept    json
// @Produce   json
// @Success   200		{array}	  []models.Role		"OK"
// @Failure   500		{object}	models.ErrorResponse	" "
// @Security	ApiKeyAuth
// @Param		  x-api-key 	    header	string	true	"ApiKey header"
// @Router	  /users/roles [get]
func GetRoles(ctx *gin.Context) {
	var err error
	var sql string

	conn := utils.GetConn(ctx)
	defer conn.Release()

	sql = "SELECT id, role FROM roles;"
	rows, err := conn.Query(context.Background(), sql)
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, &models.ErrorResponse{Error: err.Error()})
		return
	}
	defer rows.Close()

	roles, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.Role])
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, &models.ErrorResponse{Error: err.Error()})
		return
	}

	ctx.IndentedJSON(http.StatusOK, &roles)
}

// @Summary	Deletes the user
// @Tags	    Users
// @Accept    json
// @Produce   json
// @Param     id    query     string  true  "User Id"
// @Success   200		{object}	models.OkResponse "OK"
// @Failure   500		{object}	models.ErrorResponse  " "
// @Router	  /users/delete-user [delete]
func DeleteUser(ctx *gin.Context) {
	var err error
	var sql string
	var args pgx.NamedArgs
  userId := ctx.Query("id")

	if userId == "" {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: "Id param missing"})
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

	sql = "delete from users where id = @userId;"
	args = pgx.NamedArgs{"userId": &userId}
	_, err = conn.Exec(context.Background(), sql, args)
	if err != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: err.Error()},
		)
		return
	}

	ctx.IndentedJSON(http.StatusOK, &models.OkResponse{Message: "OK"})
}

// @Summary	Get all users
// @Tags	    Users
// @Accept    json
// @Produce   json
// @Success   200		{array}	  []controllers.GetUsers.User "OK"
// @Failure   500		{object}	models.ErrorResponse  " "
// @Router	  /users/get-users [get]
func GetUsers(ctx *gin.Context) {
	var err error
	var sql string

	type User struct {
		Id         string     `json:"id,omitempty"`
		Username   string     `json:"username,omitempty"`
		Role       string     `json:"role,omitempty"`
		Created_At *time.Time `json:"created_at,omitempty"`
	}

	conn := utils.GetConn(ctx)
	defer conn.Release()

	sql = "select id, username, role, created_at from users;"
	rows, err := conn.Query(context.Background(), sql)
	if err != nil {
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: err.Error()},
		)
		return
	}
	defer rows.Close()

	users, err := pgx.CollectRows(rows, pgx.RowToStructByName[User])
	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, &models.ErrorResponse{Error: err.Error()})
		return
	}

	ctx.IndentedJSON(http.StatusOK, &users)
}

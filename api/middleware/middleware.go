package middleware

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"

	"github.com/frederick-gomez/go-api/models"
	"github.com/frederick-gomez/go-api/utils"
)

func ValidateSession() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var err error
		var sql string
		var args pgx.NamedArgs

		conn := utils.GetConn(ctx)
		defer conn.Release()

		sessionToken, err := ctx.Cookie("session_token")
		if err != nil {
			ctx.Header("error", "Invalid or missing session token")
			ctx.AbortWithStatus(http.StatusUnauthorized)
			slog.Error("Invalid or missing session token")
			return
		}

		decryptedSessionId, err := utils.DecryptValue(sessionToken)
		if err != nil {
			ctx.AbortWithStatusJSON(
				http.StatusInternalServerError,
				&models.ErrorResponse{Error: err.Error()},
			)
			slog.Error(err.Error())
			return
		}

		session := &models.Session{Id: decryptedSessionId}

		sql = "select expiration, user_id from sessions where id = @sessionId;"
		args = pgx.NamedArgs{"sessionId": &session.Id}
		err = conn.QueryRow(context.Background(), sql, args).Scan(&session.Expiration, &session.UserId)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				ctx.Header("error", "Invalid session")
				ctx.AbortWithStatus(http.StatusUnauthorized)
				return
			}
			ctx.AbortWithStatusJSON(
				http.StatusInternalServerError,
				&models.ErrorResponse{Error: err.Error()},
			)
			slog.Error(err.Error())
			return
		}

		if session.Expiration.Before(time.Now()) {
			sql = "delete from sessions where id = @sessionId;"
			args = pgx.NamedArgs{"sessionId": &session.Id}
			_, err = conn.Exec(context.Background(), sql, args)
			if err != nil {
				ctx.AbortWithStatusJSON(
					http.StatusInternalServerError,
					&models.ErrorResponse{Error: err.Error()},
				)
				slog.Error(err.Error())
				return
			}

			ctx.SetCookie("session_token", "", -1, "/", "", false, true)
			ctx.Header("error", "Session expired")
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		ctx.Set("session_token", session.Id)
		ctx.Set("user_id", session.UserId)
		ctx.Next()
	}
}

func ValidateApiKey() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ApiKey, hasValue := os.LookupEnv("API_KEY")
		if !hasValue {
      slog.Error("API_KEY not defined")
		}

		reqKey := ctx.GetHeader("x-api-key")
		if reqKey == "" {
			ctx.Header("error", "Missing x-api-key")
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		if ApiKey != reqKey {
			ctx.Header("error", "Invalid ApiKey")
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		ctx.Next()
	}
}

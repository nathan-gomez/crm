package middleware

import (
	"context"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"

	"github.com/frederick-gomez/go-api/models"
	"github.com/frederick-gomez/go-api/utils"
)

func ValidateSession() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var err error
		conn := utils.GetConn(ctx)
		defer conn.Release()

		sessionToken, err := ctx.Cookie("session_token")
		if err != nil {
			ctx.Header("error", "Invalid or missing session token")
			ctx.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		decryptedSessionId, err := utils.DecryptValue(sessionToken)
		if err != nil {
			ctx.AbortWithStatusJSON(
				http.StatusInternalServerError,
				&models.ErrorResponse{Error: err.Error()},
			)
			return
		}

		// TODO: Handle session expire time
		sql := "select id from sessions where id = @sessionId;"
		args := &pgx.NamedArgs{"sessionId": &decryptedSessionId}
		err = conn.QueryRow(context.Background(), sql, args).Scan(&decryptedSessionId)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				ctx.Header("error", "Session expired")
				ctx.AbortWithStatus(http.StatusUnauthorized)
				return
			}
			ctx.AbortWithStatusJSON(
				http.StatusInternalServerError,
				&models.ErrorResponse{Error: err.Error()},
			)
			return
		}

		ctx.Set("session_token", decryptedSessionId)
		ctx.Next()
	}
}

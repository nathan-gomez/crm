package middleware

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"github.com/frederick-gomez/go-api/models"
	"github.com/frederick-gomez/go-api/utils"
)

func ValidateSession() gin.HandlerFunc {
	return func(ctx *gin.Context) {
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
		if result := utils.DB.Table("sessions").Where("id = ?", decryptedSessionId); result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				ctx.Header("error", "Session expired")
				ctx.AbortWithStatus(http.StatusUnauthorized)
				return
			}

			ctx.AbortWithStatusJSON(
				http.StatusInternalServerError,
				&models.ErrorResponse{Error: result.Error.Error()},
			)
			return
		}

		ctx.Set("session_token", decryptedSessionId)
		ctx.Next()
	}
}

package middleware

import (
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/frederick-gomez/go-api/models"
	"github.com/frederick-gomez/go-api/utils"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func ValidateApiKey() gin.HandlerFunc {
	envErr := godotenv.Load(".env")
	if envErr != nil {
		log.Fatalf("Error loading env file")
	}

	ApiKey := os.Getenv("API_KEY")

	return func(ctx *gin.Context) {
		ApiKeyHeader := ctx.Request.Header.Get("x-api-key")

		if len(ApiKeyHeader) == 0 || ApiKey != ApiKeyHeader {
			ctx.Header("error", "Missing x-api-key")
			ctx.AbortWithStatus(http.StatusUnauthorized)
		}
		ctx.Next()
	}
}

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

		//TODO: Handle session expire time
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

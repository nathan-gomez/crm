package middleware

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
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
			ctx.AbortWithStatus(http.StatusUnauthorized)
		}
		ctx.Next()
	}
}

package main

import (
	"github.com/frederick-gomez/go-api/controllers"
	docs "github.com/frederick-gomez/go-api/docs"
	"github.com/frederick-gomez/go-api/middleware"
	"github.com/frederick-gomez/go-api/models"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func init() {
	models.ConnectToDatabase()
}

// @securityDefinitions.apikey	ApiKeyAuth
// @in													header
// @name												X-API-Key
func main() {
	// gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	port := ":8080"

	docs.SwaggerInfo.BasePath = "/v1"
	docs.SwaggerInfo.Host = "http://localhost" + port
	docs.SwaggerInfo.Title = "Base API"
	docs.SwaggerInfo.Version = "1.0"

	url := ginSwagger.URL("http://localhost" + port + "/swagger/doc.json")
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, url))

	v1 := router.Group("/v1")
	{
		v1.Use(middleware.ValidateApiKey())

		auth := v1.Group("/auth")
		{
			auth.GET("/users", controllers.GetUsers)
			auth.POST("/login", controllers.Login)
			auth.POST("/create-user", controllers.CreateUser)
		}
	}

	router.Run(port)
}

package main

import (
	"log"

	"github.com/frederick-gomez/go-api/controllers"
	docs "github.com/frederick-gomez/go-api/docs"
	"github.com/frederick-gomez/go-api/middleware"
	"github.com/frederick-gomez/go-api/utils"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func init() {
	envErr := godotenv.Load(".env")
	if envErr != nil {
		log.Fatalf("Error loading env file")
	}

	utils.ConnectToDatabase()
}

func main() {
	// gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowHeaders = []string{}
	config.AllowCredentials = true
	router.Use(cors.New(config))

	port := ":8080"

	docs.SwaggerInfo.BasePath = "/v1"
	docs.SwaggerInfo.Host = "http://localhost" + port
	docs.SwaggerInfo.Title = "Base API"
	docs.SwaggerInfo.Version = "1.0"

	url := ginSwagger.URL("http://localhost" + port + "/swagger/doc.json")
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, url))

	v1 := router.Group("/v1")
	{

		auth := v1.Group("/auth")
		{
			auth.POST("/login", controllers.Login)
			auth.POST("/logout", middleware.ValidateSession(), controllers.Logout)
			auth.POST("/create-user", middleware.ValidateSession(), controllers.CreateUser)
		}
	}

	router.Run(port)
}

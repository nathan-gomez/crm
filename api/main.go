package main

import (
	"fmt"
	"log/slog"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"github.com/frederick-gomez/go-api/controllers"
	docs "github.com/frederick-gomez/go-api/docs"
	"github.com/frederick-gomez/go-api/middleware"
	"github.com/frederick-gomez/go-api/utils"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		slog.Error("Error loading env file")
	}
  appEnv := os.Getenv("APP_ENV")

  //Logger
	opts := &slog.HandlerOptions{AddSource: true}
	var handler slog.Handler
	if appEnv == "PRODUCTION" {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	} else {
		handler = slog.NewTextHandler(os.Stdout, opts)
  }

	logger := slog.New(handler)
	slog.SetDefault(logger)

	utils.ConnectToDatabase()
	defer utils.DB.Close()

	if appEnv == "PRODUCTION" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowCredentials = true
	router.Use(cors.New(config))

	port := ":6969"

	docs.SwaggerInfo.BasePath = "/v1"
	docs.SwaggerInfo.Host = "http://localhost" + port
	docs.SwaggerInfo.Title = "Base API"
	docs.SwaggerInfo.Version = "1.0"

	url := ginSwagger.URL("http://localhost" + port + "/swagger/doc.json")
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, url))

	v1 := router.Group("/v1")
	{

		users := v1.Group("/users")
		{
			users.POST("/login", controllers.Login)
			users.GET("/logout", middleware.ValidateSession(), controllers.Logout)
			users.POST("/create-user", middleware.ValidateSession(), controllers.CreateUser)
			users.GET("/user-data", middleware.ValidateSession(), middleware.ValidateApiKey(), controllers.UserData)
			users.GET("/roles", middleware.ValidateSession(), middleware.ValidateApiKey(), controllers.GetRoles)
			users.DELETE("/delete-user/:id", middleware.ValidateSession(), controllers.DeleteUser)
			users.GET("/get-users", middleware.ValidateSession(), controllers.GetUsers)
			users.PUT("/edit-user", middleware.ValidateSession(), controllers.EditUser)
		}

		clients := v1.Group("/clientes")
		clients.Use(middleware.ValidateSession())
		{
			clients.GET("/", controllers.GetAllClients)
			clients.POST("/crear-cliente", controllers.AddClient)
			clients.GET("/cliente/:id", controllers.GetClient)
			clients.PUT("/actualizar-cliente", controllers.UpdateClient)
			clients.DELETE("/eliminar-cliente/:id", controllers.DeleteClient)
		}

		inventario := v1.Group("/inventario")
		inventario.Use(middleware.ValidateSession())
		{
			inventario.GET("/", controllers.GetAllItems)
			inventario.POST("/crear-item", controllers.AddItem)
		}
	}

	slog.Info(fmt.Sprintf("Listening on port %v", port))
	router.Run(port)
}

package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"

	"github.com/frederick-gomez/go-api/controllers"
	docs "github.com/frederick-gomez/go-api/docs"
	"github.com/frederick-gomez/go-api/middleware"
	"github.com/frederick-gomez/go-api/utils"
)

func main() {
	utils.ConnectToDatabase()
	defer utils.DB.Close()

	// gin.SetMode(gin.ReleaseMode)
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
		{
			clients.POST("/crear-cliente", controllers.AddClient)
			clients.GET("/cliente/:id", controllers.GetClient)
			clients.PUT("/actualizar-cliente", controllers.UpdateClient)
		}
	}

	router.Run(port)
}

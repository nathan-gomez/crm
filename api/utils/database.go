package utils

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"github.com/frederick-gomez/go-api/models"
)

// Connection to database
var DB *pgxpool.Pool

func ConnectToDatabase() {
	var err error

	err = godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading env file")
	}

	connectionString := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	dbpool, err := pgxpool.New(context.Background(), connectionString)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v\n", err)
	}

  log.Printf("Connection to database successful in %v", connectionString)
	DB = dbpool
}

// Adquire a connection from the database pool
func GetConn(ctx *gin.Context) *pgxpool.Conn {
	conn, err := DB.Acquire(context.Background())

	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, &models.ErrorResponse{Error: err.Error()})
		return nil
	}

	return conn
}

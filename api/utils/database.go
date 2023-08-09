package utils

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Make connection to DB
var DB *gorm.DB

func ConnectToDatabase() {
	envErr := godotenv.Load(".env")
	if envErr != nil {
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

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second,   // Slow SQL threshold
			LogLevel:                  logger.Silent, // Log level
			IgnoreRecordNotFoundError: true,          // Ignore ErrRecordNotFound error for logger
			ParameterizedQueries:      false,         // Don't include params in the SQL log
			Colorful:                  true,          // Disable color
		},
	)

	log.Printf("Opening connection to db: %s", connectionString)
	database, dbErr := gorm.Open(postgres.Open(connectionString), &gorm.Config{
		Logger: newLogger,
	})

	if dbErr != nil {
		log.Fatal("Failed to connect to database")
	}

	DB = database
}

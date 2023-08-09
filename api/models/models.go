package models

import (
	"time"

	"github.com/google/uuid"
)

type OkResponse struct {
	Message string `json:"message"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type User struct {
	Id        string    `gorm:"primary_key" json:"id"`
	Username  string    `gorm:"size:500 unique" json:"username"`
	Password  string    `gorm:"password" json:"password"`
	Role      string    `gorm:"size:500" json:"role"`
	CreatedAt time.Time `gorm:"column:created_at type:timestamp" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at type:timestamp" json:"updated_at"`
}

type Session struct {
	Id        uuid.UUID `gorm:"primary_key" json:"id"`
	Username  string    `gorm:"size:500 unique" json:"username"`
	CreatedAt time.Time `json:"created_at"`
}

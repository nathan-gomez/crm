package models

import (
	"time"
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
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Session struct {
	Id        string    `gorm:"primary_key" json:"id"`
	Username  string    `gorm:"size:500 unique" json:"username"`
	CreatedAt time.Time `json:"created_at"`
}

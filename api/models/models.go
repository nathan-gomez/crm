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
	Id        string     `json:"id,omitempty"`
	Username  string     `json:"username,omitempty"`
	Password  string     `json:"password,omitempty"`
	Role      string     `json:"role,omitempty"`
	CreatedAt *time.Time `json:"created_at,omitempty"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}

type Session struct {
	Id        string     `gorm:"primary_key"     json:"id"`
	Username  string     `gorm:"size:500 unique" json:"username"`
	CreatedAt *time.Time `                       json:"created_at"`
}

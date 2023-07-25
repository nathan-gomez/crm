package models

import "time"

type OkResponse struct {
	Message string `json:"message"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type User struct {
	Id        string    `gorm:"primary_key" json:"id"`
	Name      string    `gorm:"size:500 unique" json:"name"`
	Password  string    `gorm:"password" json:"password"`
	Role      string    `gorm:"size:500" json:"role"`
	CreatedAt time.Time `gorm:"column:created_at type:timestamp" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at type:timestamp" json:"updated_at"`
}

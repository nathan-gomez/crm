package models

import (
	"time"
)

const (
	Admin   = "admin"
	Usuario = "usuario"
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
	Id         string     `json:"id"`
	UserId     string     `json:"user_id"`
	Expiration *time.Time `json:"expiration"`
	CreatedAt  *time.Time `json:"created_at"`
}

type Role struct {
	Id   int32  `json:"id,omitempty"`
	Role string `json:"role,omitempty"`
}

type Cliente struct {
	Id         int32   `json:"id,omitempty"`
	Nombre     string  `json:"nombre"`
	Tipo       *string `json:"tipo"`
	Ruc        *string `json:"ruc"`
	NroTel     *string `json:"nro_tel"`
	Comentario *string `json:"comentario"`
}

package models

type LoginReq struct {
	User     string `json:"user" binding:"required"`
	Password string `json:"password" binding:"required"`
}

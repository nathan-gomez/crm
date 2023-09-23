package models

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role"     binding:"required"`
}

type EditUserRequest struct {
	Id       string `json:"id"       binding:"required"`
	Username string `json:"username" binding:"required"`
	Role     string `json:"role"     binding:"required"`
}

type AddClientRequest struct {
	Nombre     string `json:"nombre" binding:"required"`
	Tipo       string `json:"tipo"   binding:"required"`
	Ruc        string `json:"ruc"`
	NroTel     string `json:"nro_tel"`
	Comentario string `json:"comentario"`
}

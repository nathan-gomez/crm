package controllers

import (
	"context"
	"errors"
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"

	"github.com/frederick-gomez/go-api/models"
	"github.com/frederick-gomez/go-api/utils"
)

// @Summary	Creates a new client
// @Tags		Clients
// @Accept	json
// @Produce	json
// @Param		Body	body  		models.AddClientRequest	true	" "
// @Success	201		{object}	models.OkResponse "OK"
// @Failure	401		{object}	models.ErrorResponse	" "
// @Failure	400		{object}	models.ErrorResponse	" "
// @Failure	500		{object}	models.ErrorResponse	" "
// @Router	/clientes/crear-cliente [post]
func AddClient(ctx *gin.Context) {
	var err error
	var sql string
	var args pgx.NamedArgs
	req := models.AddClientRequest{}

	if err = ctx.ShouldBindJSON(&req); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	conn := utils.GetConn(ctx)
	defer conn.Release()

	sql = "insert into clientes (nombre, tipo, ruc, nro_tel, comentario) values(@nombre, @tipo, @ruc, @nro_tel, @comentario);"
	args = pgx.NamedArgs{"nombre": req.Nombre, "tipo": req.Tipo, "ruc": req.Ruc, "nro_tel": req.NroTel, "comentario": req.Comentario}
	_, err = conn.Exec(context.Background(), sql, args)
	if err != nil {
		slog.Error(err.Error())
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: err.Error()},
		)
		return
	}

	ctx.IndentedJSON(http.StatusCreated, &models.OkResponse{Message: "OK"})
}

// @Summary	  Gets data of a client
// @Tags	    Clients
// @Accept    json
// @Produce   json
// @Param     id    query     string  true    "Client Id"
// @Success   200		{object}	models.Cliente  "OK"
// @Failure   500		{object}	models.ErrorResponse	" "
// @Router	  /clientes/cliente/{id}  [get]
func GetClient(ctx *gin.Context) {
	var err error
	var sql string
	var args pgx.NamedArgs

	conn := utils.GetConn(ctx)
	defer conn.Release()

	clientId := ctx.Param("id")
	client := &models.Cliente{}

	sql = "select nombre, tipo, ruc, nro_tel, comentario from clientes where id = @clientId;"
	args = pgx.NamedArgs{"clientId": clientId}
	err = conn.QueryRow(context.Background(), sql, args).Scan(&client.Nombre, &client.Tipo, &client.Ruc, &client.NroTel, &client.Comentario)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			ctx.AbortWithStatus(http.StatusNoContent)
			return
		}
		slog.Error(err.Error())
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, &models.ErrorResponse{Error: err.Error()})
		return
	}

	ctx.IndentedJSON(http.StatusOK, &client)
}

// @Summary 	Updates a clients info
// @Tags	    Clients
// @Accept    json
// @Produce   json
// @Param		  Body	body		  models.Cliente	true	" "
// @Success   200		{object}	models.OkResponse "OK"
// @Failure   500		{object}	models.ErrorResponse  " "
// @Router	  /clientes/actualizar-cliente [put]
func UpdateClient(ctx *gin.Context) {
	var err error
	var sql string
	var args pgx.NamedArgs
	req := &models.Cliente{}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, &models.ErrorResponse{Error: err.Error()})
		return
	}

	conn := utils.GetConn(ctx)
	defer conn.Release()

	sql = "update clientes set nombre = @nombre, tipo = @tipo, ruc = @ruc, nro_tel = @nroTel, comentario = @comentario where id = @id;"
	args = pgx.NamedArgs{"id": &req.Id, "nombre": &req.Nombre, "tipo": &req.Tipo, "ruc": &req.Ruc, "nroTel": &req.NroTel, "comentario": &req.Comentario}
	_, err = conn.Exec(context.Background(), sql, args)
	if err != nil {
		slog.Error(err.Error())
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: err.Error()},
		)
		return
	}

	ctx.IndentedJSON(http.StatusOK, &models.OkResponse{Message: "OK"})
}

// @Summary	  Gets all clients
// @Tags	    Clients
// @Accept    json
// @Produce   json
// @Success   200		{array}	  []models.Cliente  "OK"
// @Failure   500		{object}	models.ErrorResponse	" "
// @Router	  /clientes  [get]
func GetAllClients(ctx *gin.Context) {
	var err error
	var sql string

	conn := utils.GetConn(ctx)
	defer conn.Release()

	sql = "SELECT id, nombre FROM clientes order by id desc;"
	rows, err := conn.Query(context.Background(), sql)
	if err != nil {
		slog.Error(err.Error())
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, &models.ErrorResponse{Error: err.Error()})
		return
	}
	defer rows.Close()

	clients, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.ClientsResponse])
	if err != nil {
		slog.Error(err.Error())
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, &models.ErrorResponse{Error: err.Error()})
		return
	}

	ctx.IndentedJSON(http.StatusOK, &clients)
}

// @Summary	Deletes a client
// @Tags	    Clients
// @Accept    json
// @Produce   json
// @Param     id    query     string  true  "Client Id"
// @Success   200		{object}	models.OkResponse "OK"
// @Failure   500		{object}	models.ErrorResponse  " "
// @Router	  /clientes/eliminar-cliente/{id} [delete]
func DeleteClient(ctx *gin.Context) {
	var err error
	var sql string
	var args pgx.NamedArgs

	conn := utils.GetConn(ctx)
	defer conn.Release()

	clientId := ctx.Param("id")
	sql = "delete from clientes where id = @clientId;"
	args = pgx.NamedArgs{"clientId": &clientId}
	_, err = conn.Exec(context.Background(), sql, args)
	if err != nil {
		slog.Error(err.Error())
		ctx.AbortWithStatusJSON(
			http.StatusInternalServerError,
			&models.ErrorResponse{Error: err.Error()},
		)
		return
	}

	ctx.IndentedJSON(http.StatusOK, &models.OkResponse{Message: "OK"})
}

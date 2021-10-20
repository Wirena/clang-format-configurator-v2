package server

import (
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
)

type server struct {
	router *mux.Router
	logger *log.Logger
}

func NewServer()

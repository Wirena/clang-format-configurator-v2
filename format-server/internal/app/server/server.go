package server

import (
	"net/http"

	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
)

type server struct {
	router *mux.Router
	logger *log.Logger
}

func Start(config *Config) error {
	s := newServer()
	s.logger.Infof(`Starting server with config parameters:\n 
	BindAddr: %s\n
	DatabaseURL %s\n
	DatabaseUser %s\n`, config.BindAddr, config.DatabaseURL, config.DatabaseUser)
	return http.ListenAndServe(config.BindAddr, s)
}

func newServer() *server {
	s := &server{router: mux.NewRouter(),
		logger: log.New()}
	return s
}

package server

import (
	"net/http"

	"github.com/Wirena/clang-format-configurator-v2/internal/app/formatter"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
)

type server struct {
	router    *mux.Router
	formatter *formatter.Formatter
}

func (s *server) configureRouter() {
	s.router.Use(handlers.CORS(handlers.AllowedOrigins([]string{"*"})))
	api := s.router.PathPrefix("/api/").Subrouter()
	api.HandleFunc("/format", s.formatHandler).Methods("GET")
}

func Start(config *Config) error {
	s := newServer()
	log.Infof(`Starting server with config parameters:\n 
	BindAddr: %s\n
	DatabaseURL %s\n
	DatabaseUser %s\n`, config.BindAddr, config.DatabaseURL, config.DatabaseUser)
	return http.ListenAndServe(config.BindAddr, s)
}

func newServer() *server {
	s := &server{router: mux.NewRouter(),
		formatter: formatter.NewFormatter(),
	}
	s.configureRouter()
	return s
}

func (s *server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

func (s *server) formatHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	if len(query["version"]) != 1 {
		w.WriteHeader(http.StatusBadRequest)
	}
}

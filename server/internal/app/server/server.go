package server

import (
	"net/http"

	"github.com/Wirena/clang-format-configurator-v2/internal/app/formatter"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type Server struct {
	router    *mux.Router
	formatter *formatter.Formatter
	bindAddr  string
}

func (s *Server) Start() error {
	return http.ListenAndServe(s.bindAddr, s)
}

func (s *Server) configureRouter() {
	s.router.Use(handlers.CORS(handlers.AllowedOrigins([]string{"*"})))
	s.router.HandleFunc("/format", s.formatHandler).Methods("POST")
}

func NewServer(frmt *formatter.Formatter, bindAddr string) *Server {
	s := &Server{router: mux.NewRouter(),
		formatter: frmt,
		bindAddr:  bindAddr,
	}
	s.configureRouter()
	return s
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

/*
Format endpoint

Request
Method: POST
Query string:
version: major version of clang-format, integer
Body, content-type application/json, charset utf-8:
code:  piece of code to format, string
style: contents of .clang-format file, string

Response
Formatted code on 200 OK
*/
func (s *Server) formatHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		w.WriteHeader(http.StatusNotFound)
		return
	}
	query := r.URL.Query()
	res := "good"
	if len(query["version"]) == 1 {
		res = res + query["version"][0]
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(res))
}

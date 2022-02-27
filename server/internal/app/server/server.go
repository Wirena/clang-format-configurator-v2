package server

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Wirena/clang-format-configurator-v2/internal/app/formatter"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

type Server struct {
	router    *mux.Router
	formatter *formatter.Formatter
	bindAddr  string
}

// Export for testing.

func (srv *Server) Start() error {
	return http.ListenAndServe(srv.bindAddr, srv)
}

func (srv *Server) configureRouter() {
	srv.router.Use(handlers.CORS(handlers.AllowedOrigins([]string{"*"})))
	srv.router.HandleFunc("/format", srv.formatHandler).Methods("POST")
}

func NewServer(frmt *formatter.Formatter, bindAddr string) *Server {
	s := &Server{router: mux.NewRouter(),
		formatter: frmt,
		bindAddr:  bindAddr,
	}
	s.configureRouter()
	return s
}

func (srv *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	srv.router.ServeHTTP(w, r)
}

/*
Format endpoint

Request
Method: POST
Query string:
version:  major version of clang-format, integer
filename: filename extension to assume language
Body, content-type application/json, charset utf-8:
code:  piece of code to format, string
style: contents of .clang-format file, string

Response
Formatted code on 200 OK
*/

type formatRequestBody struct {
	Code  string `json:"code"`
	Style string `json:"style"`
}

func (srv *Server) formatHandler(rw http.ResponseWriter, req *http.Request) {
	if !req.URL.Query().Has("version") {
		http.Error(rw, "No version parameter in query", http.StatusBadRequest)
		return
	}
	versionString := req.URL.Query().Get("version")
	version, err := strconv.Atoi(versionString)
	if err != nil {
		http.Error(rw, "Failed to Atoi version number", http.StatusBadRequest)
		return
	}

	if !req.URL.Query().Has("filename") {
		http.Error(rw, "No filename parameter in query", http.StatusBadRequest)
		return
	}
	filenameExt := req.URL.Query().Get("filename")

	if !srv.formatter.VersionAvailable(version) {
		http.Error(rw, "No such version", http.StatusBadRequest)
		return
	}

	var body formatRequestBody
	decoder := json.NewDecoder(req.Body)
	err = decoder.Decode(&body)
	if err != nil {
		http.Error(rw, "Failed to decode request body", http.StatusBadRequest)
		return
	}
	formattedCode, err := srv.formatter.Format(version, filenameExt, &body.Code, &body.Style)
	if err != nil {
		if inpErr, ok := err.(*formatter.InputError); ok {
			http.Error(rw, inpErr.Error(), http.StatusBadRequest)
		} else if inpErr, ok := err.(*formatter.InternalError); ok {
			http.Error(rw, inpErr.Error(), http.StatusInternalServerError)
		}
		return
	}
	rw.WriteHeader(http.StatusOK)
	rw.Header().Set("Content-Type", "application/json")
	rw.Write(formattedCode)
}

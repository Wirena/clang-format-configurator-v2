package main

import (
	"encoding/json"
	"os"

	"github.com/Wirena/clang-format-configurator-v2/internal/app/config"
	"github.com/Wirena/clang-format-configurator-v2/internal/app/formatter"
	"github.com/Wirena/clang-format-configurator-v2/internal/app/server"
	"github.com/alexflint/go-arg"
	log "github.com/sirupsen/logrus"
)

func main() {
	config := config.NewConfig()
	arg.MustParse(config)
	if len(config.ConfigPath) != 0 {
		jsonReader, err := os.Open(config.ConfigPath)
		if err != nil {
			log.Errorf("Failed to read config %s : %s", config.ConfigPath, err)
		} else {
			decoder := json.NewDecoder(jsonReader)
			decoder.Decode(&config)
		}
		jsonReader.Close()
	}
	log.Infof("Configuration:\n%+v", config)
	ll, err := log.ParseLevel(config.LogLevel)
	if err != nil {
		log.Fatalf("Failed to parse log level from config")
	}
	log.SetLevel(ll)
	formatter, err := formatter.NewFormatter(&config.Versions)
	if err != nil {
		log.Fatal(err)
	}
	s := server.NewServer(formatter, config.BindAddr)
	if len(config.CertFile) == 0 || len(config.PKeyFile) == 0 {
		log.Info("Staring HTTP server")
		err = s.Start()
	} else {
		log.Info("Staring HTTPS server")
		err = s.StartTLS(config.CertFile, config.PKeyFile)
	}
	log.Fatal(err)
}

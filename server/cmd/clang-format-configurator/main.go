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
	log.Infof(`Parsed parameters:\n 
	Bind address: %s\n
	Log level: %s`, config.BindAddr, config.LogLevel)
	formatter, err := formatter.NewFormatter(&config.Versions)
	if err != nil {
		log.Fatal(err)
	}
	s := server.NewServer(formatter, config.BindAddr)
	err = s.Start()
	log.Fatal(err)
}

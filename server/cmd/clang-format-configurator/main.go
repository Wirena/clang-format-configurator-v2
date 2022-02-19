package main

import (
	"github.com/BurntSushi/toml"
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
		_, err := toml.DecodeFile(config.ConfigPath, &config)
		if err != nil {
			log.Info("Failed to parse config file", err)
		}
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

package main

import (
	"github.com/BurntSushi/toml"
	"github.com/Wirena/clang-format-configurator-v2/internal/app/server"
	arg "github.com/alexflint/go-arg"
	log "github.com/sirupsen/logrus"
)

func main() {
	cmdArgs := server.NewCmdArgs()
	arg.MustParse(cmdArgs)
	if len(cmdArgs.ConfigPath) != 0 {
		_, err := toml.DecodeFile(cmdArgs.ConfigPath, &cmdArgs.Config)
		if err != nil {
			log.Info("Failed to parse config file", err)
		}
	}
	error := server.Start(&cmdArgs.Config)
	if error != nil {
		log.Fatal("Failed to start server", error)
	}

}

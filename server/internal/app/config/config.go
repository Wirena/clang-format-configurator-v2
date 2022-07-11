package config

import "fmt"

type Config struct {
	ConfigPath string            `arg:"-c" help:"path to config file" default:"./config.json"`
	BindAddr   string            `json:"bind-addr" arg:"-b"`
	LogLevel   string            `json:"log-level" arg:"-l"`
	CertFile   string            `json:"certificate-file" arg:"-c"`
	PKeyFile   string            `json:"key-file" arg:"-k"`
	Versions   map[string]string `json:"versions"`
}

func NewConfig() *Config {
	return &Config{
		ConfigPath: "./config.json",
		BindAddr:   ":8080",
		LogLevel:   "debug",
	}
}

func (c Config) String() string {
	return fmt.Sprintf("BindAddr: %s\nLogLevel: %s\nCertFile: %s\nPKeyFile: %s", c.BindAddr, c.LogLevel, c.CertFile, c.PKeyFile)
}

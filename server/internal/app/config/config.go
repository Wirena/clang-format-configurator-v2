package config

type Config struct {
	ConfigPath string            `arg:"-c" help:"path to config file" default:"./config.json"`
	BindAddr   string            `json:"bind-addr" arg:"-b"`
	LogLevel   string            `json:"log-level" arg:"-l"`
	Versions   map[string]string `json:"versions"`
}

func NewConfig() *Config {
	return &Config{
		ConfigPath: "./config.json",
		BindAddr:   ":8080",
		LogLevel:   "debug",
	}
}

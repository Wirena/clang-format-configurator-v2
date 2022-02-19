package config

type Config struct {
	ConfigPath string            `arg:"-c" help:"path to config file" default:"./config.toml"`
	BindAddr   string            `toml:"bind-addr" arg:"-b"`
	LogLevel   string            `toml:"log-level" arg:"-l"`
	Versions   map[string]string `toml:"versions"`
}

func NewConfig() *Config {
	return &Config{
		ConfigPath: "./config.toml",
		BindAddr:   ":8080",
		LogLevel:   "debug",
	}
}

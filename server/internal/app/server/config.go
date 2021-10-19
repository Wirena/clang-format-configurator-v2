package server

type Config struct {
	BindAddr         string `toml:"bind_addr" arg:"-b"`
	LogLevel         string `toml:"log_level" arg:"-l"`
	DatabaseURL      string `toml:"database_url" arg:"-url"`
	DatabaseUser     string `toml:"database_user" arg:"-u,--dbuser"`
	DatabasePassword string `toml:"database_password" arg:"-p,--dbpswd"`
}

// NewConfig ...
func NewConfig() *Config {
	return &Config{
		BindAddr: ":8080",
		LogLevel: "debug",
	}
}

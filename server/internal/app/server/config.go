package server

type Config struct {
	BindAddr         string `toml:"bind_addr" arg:"-b"`
	LogLevel         string `toml:"log_level" arg:"-l"`
<<<<<<< HEAD
	DatabaseURL      string `toml:"database_url" arg:"-l" help:"url to database"`
	DatabaseUser     string `toml:"database_user" arg:"-u,--dbuser" help:"database user"`
	DatabasePassword string `toml:"database_password" arg:"-p,--dbpassword" help:"database password"`
=======
	DatabaseURL      string `toml:"database_url" arg:"-url"`
	DatabaseUser     string `toml:"database_user" arg:"-u,--dbuser"`
	DatabasePassword string `toml:"database_password" arg:"-p,--dbpswd"`
>>>>>>> 3aa214a157b0edb19e64b0ab482a84e4a73a8688
}

// NewConfig ...
func NewConfig() *Config {
	return &Config{
		BindAddr: ":8080",
		LogLevel: "debug",
	}
}

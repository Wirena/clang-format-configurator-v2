package server

type Config struct {
	BindAddr         string `toml:"bind_addr" arg:"-b"`
	LogLevel         string `toml:"log_level" arg:"-l"`
	DatabaseURL      string `toml:"database_url" arg:"-l" help:"url to database"`
	DatabaseUser     string `toml:"database_user" arg:"-u,--dbuser" help:"database user"`
	DatabasePassword string `toml:"database_password" arg:"-p,--dbpassword" help:"database password"`
	DocsPath         string `toml:"docs_path" arg:"-d,--docs"`
}

// NewConfig ...
func NewConfig() *Config {
	return &Config{
		BindAddr: ":8080",
		LogLevel: "debug",
		DocsPath: "./",
	}
}

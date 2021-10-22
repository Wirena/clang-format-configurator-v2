package server

func (CmdArgs) Description() string {
	return "format server"
}

type CmdArgs struct {
	ConfigPath string `arg:"-c" help:"path to config file" default:"./config.toml"`
	Config
}

func NewCmdArgs() *CmdArgs {
	return &CmdArgs{
		Config: *NewConfig(),
	}
}

package server

func (CmdArgs) Description() string {
	return "format server"
}

type CmdArgs struct {
	ConfigPath string `arg:"-c" help:"path to config file"`
	Config
}

func NewCmdArgs() *CmdArgs {
	return &CmdArgs{
		Config: *NewConfig(),
	}
}

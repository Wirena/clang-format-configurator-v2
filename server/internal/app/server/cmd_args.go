package server

<<<<<<< HEAD
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
=======
type CmdArgs struct {
	printHelp  bool   `arg:"-h,--help"`
	configPath string `arg:"-c"`
	config     Config
>>>>>>> 3aa214a157b0edb19e64b0ab482a84e4a73a8688
}

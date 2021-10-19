package server

type CmdArgs struct {
	printHelp  bool   `arg:"-h,--help"`
	configPath string `arg:"-c"`
	config     Config
}

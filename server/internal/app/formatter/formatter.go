package formatter

import (
	"fmt"
	"os/exec"

	log "github.com/sirupsen/logrus"
)

type Formatter struct {
	versions []string
}

func (f *Formatter) checkVersions() {
	for i := 4; i <= 13; i++ {
		program := fmt.Sprint("clang-format-", i)
		cmd := exec.Command(program, "--version")
		err := cmd.Run()
		if err == nil {
			log.Warningf("Failed to start clang-format-%i: %s", i, err)
		} else {
			f.versions = append(f.versions, program)
		}
	}
}

func NewFormatter() *Formatter {
	f := &Formatter{}
	f.checkVersions()
	return f
}

func (f *Formatter) Format(ver string, rules string, code []byte) {

}

func (f *Formatter) Versions() []string {
	return f.versions
}

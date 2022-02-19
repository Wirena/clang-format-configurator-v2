package formatter

import (
	"errors"
	"os/exec"
	"strconv"
	"strings"

	log "github.com/sirupsen/logrus"
)

type Formatter struct {
	executables map[int]string
}

func transformMap(inmap *map[string]string) (map[int]string, error) {
	var transformedMap map[int]string = make(map[int]string, len(*inmap))
	var atLeastOneParsed = false
	for key, value := range *inmap {
		intKey, err := strconv.Atoi(key)
		if err != nil {
			log.Warningf("Invalid version number %s - %s", key, value)
			continue
		}
		transformedMap[intKey] = value
		atLeastOneParsed = true
	}
	var err error = nil
	if !atLeastOneParsed {
		err = errors.New("failed to parse every version number")
	}
	return transformedMap, err
}

func (f *Formatter) checkAndSetExecs(versions *map[string]string) error {
	execs, err := transformMap(versions)
	if err != nil {
		return err
	}

	for version, execPath := range execs {
		cmd := exec.Command(execPath, "--version")
		output := new(strings.Builder)
		cmd.Stdout = output
		err := cmd.Run()
		if err != nil {
			log.Warningf("%s exited with code %s\n stdout:\n%s", execPath, err, output.String())
			delete(execs, version)
		}
		log.Infof("%s --version output:\n%s", execPath, output.String())
	}

	err = nil
	if len(execs) == 0 {
		err = errors.New("failed to run every single clang-format version")
	} else {
		f.executables = execs
	}
	return err
}

func NewFormatter(versions *map[string]string) (*Formatter, error) {
	f := &Formatter{}
	err := f.checkAndSetExecs(versions)
	return f, err
}

func (f *Formatter) Format(ver string, rules string, code []byte) {

}

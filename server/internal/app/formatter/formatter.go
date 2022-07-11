package formatter

import (
	"bytes"
	"errors"
	"fmt"
	"os/exec"
	"strconv"
	"strings"

	log "github.com/sirupsen/logrus"
)

type InternalError struct {
}

func (er *InternalError) Error() string {
	return "Internal error"
}

type InputError struct {
	what string
}

func (er *InputError) Error() string {
	return er.what
}

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

func (frmt *Formatter) checkAndSetExecs(versions *map[string]string) error {
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
			log.Errorf("%s exited with code %s\n stdout:\n%s", execPath, err, output.String())
			delete(execs, version)
		}
		log.Infof("%s --version output:\n%s", execPath, output.String())
	}

	err = nil
	if len(execs) == 0 {
		err = errors.New("failed to run every single clang-format version")
	} else {
		frmt.executables = execs
	}
	return err
}

func NewFormatter(versions *map[string]string) (*Formatter, error) {
	f := &Formatter{}
	err := f.checkAndSetExecs(versions)
	return f, err
}

func (frmt *Formatter) VersionAvailable(version int) bool {
	_, present := frmt.executables[version]
	return present
}

func buildCmdOptions(filenameExt string, style *string) []string {
	return []string{fmt.Sprintf("-style=%s", *style), fmt.Sprintf("--assume-filename=%s", filenameExt)}
}

func (frmt *Formatter) Format(ver int, filenameExt string, code, style *string) ([]byte, error) {
	log.Debugf("Start formatting\nversion:%d\nfilenameExt: %s\nCode:\n %s\n\n\nStyle:\n%s\n\n\n", ver, filenameExt, *code, *style)
	executable, ok := frmt.executables[ver]
	if !ok {
		return nil, errors.New("no such version")
	}
	cmd := exec.Command(executable, buildCmdOptions(filenameExt, style)...)
	reader := strings.NewReader(*code)
	cmd.Stdin = reader
	var output bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &output
	cmd.Stderr = &stderr
	err := cmd.Run()
	if err != nil {
		log.Warningf("Failed to format: %s", stderr.String())
		if _, ok := err.(*exec.ExitError); ok {
			return nil, &InputError{fmt.Sprintf("Clang-format returned non zero code\n%s", stderr.String())}
		} else {
			log.Debug("Internal Error")
			return nil, &InternalError{}
		}
	}
	log.Debugf("Finished formatting. Result:\n%s\n\n\n", output.String())
	return output.Bytes(), nil
}

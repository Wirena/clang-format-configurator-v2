package formatter

import (
	"bytes"
	"errors"
	"fmt"
	"os/exec"
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
	executables map[string]string
}

func (frmt *Formatter) checkAndSetExecs(versions *map[string]string) error {
	var err error
	for version, execPath := range *versions {
		cmd := exec.Command(execPath, "--version")
		output := new(strings.Builder)
		cmd.Stdout = output
		err = cmd.Run()
		if err != nil {
			log.Errorf("%s exited with code %s\n stdout:\n%s", execPath, err, output.String())
			delete(*versions, version)
		}
		log.Infof("%s --version output:\n%s", execPath, output.String())
	}

	if len(*versions) == 0 {
		err = errors.New("failed to run every single clang-format version")
	} else {
		frmt.executables = *versions
	}
	return err
}

func NewFormatter(versions *map[string]string) (*Formatter, error) {
	f := &Formatter{}
	err := f.checkAndSetExecs(versions)
	return f, err
}

func (frmt *Formatter) VersionAvailable(version string) bool {
	_, present := frmt.executables[version]
	return present
}

func buildCmdOptions(filenameExt string, style *string) []string {
	return []string{fmt.Sprintf("-style=%s", *style), fmt.Sprintf("--assume-filename=%s", filenameExt)}
}

func (frmt *Formatter) Format(ver string, filenameExt string, code, style *string) ([]byte, error) {
	log.Debugf("Start formatting\nversion:%s\nfilenameExt: %s\nCode:\n %s\n\n\nStyle:\n%s\n\n\n", ver, filenameExt, *code, *style)
	executable, ok := frmt.executables[ver]
	if !ok {
		return nil, errors.New("selected version is not available")
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

package formatter

type Formatter struct {
	versions []string
}

func (f *Formatter) prepareClangVersions() {

}

func NewFormatter() *Formatter {
	f := &Formatter{}
	f.prepareClangVersions()
	return f
}

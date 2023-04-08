package server

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"testing"

	"github.com/Wirena/clang-format-configurator-v2/internal/app/config"
	"github.com/Wirena/clang-format-configurator-v2/internal/app/formatter"
)

type TestCase struct {
	Version     string `json:"version"`
	Description string `json:"description"`
	FileExt     string `json:"file_extension"`
	Style       string `json:"style"`
	Code        string `json:"code"`
	Expected    string `json:"expected"`
}
type TestList []TestCase

func TestFormatEndpoint(t *testing.T) {
	testFile, _ := os.Open("testing_data.json")
	decoder := json.NewDecoder(testFile)
	var tests TestList = make(TestList, 0)
	decoder.Decode(&tests)
	testFile.Close()

	os.Chdir("../../..")
	config := config.NewConfig()
	jsonReader, _ := os.Open("config.json")
	decoder = json.NewDecoder(jsonReader)
	err := decoder.Decode(&config)
	if err != nil {
		t.Fatal()
	}
	jsonReader.Close()

	formatter, _ := formatter.NewFormatter(&config.Versions)
	srv := NewServer(formatter, "")
	for index, testCase := range tests {
		t.Run(fmt.Sprintf("Test № %d", index), func(t *testing.T) {
			recorder := httptest.NewRecorder()
			url, _ := url.Parse("/format")
			query := url.Query()
			query.Set("version", testCase.Version)
			query.Set("filename", testCase.FileExt)
			url.RawQuery = query.Encode()
			body := formatRequestBody{Code: testCase.Code, Style: testCase.Style}
			bodyBytes, _ := json.Marshal(body)
			request, _ := http.NewRequest("POST", url.String(), bytes.NewReader(bodyBytes))
			srv.formatHandler(recorder, request)
			if testCase.Expected != recorder.Body.String() {
				t.Errorf("Failed to run test №%d - %s", index, testCase.Description)
			}
		})
	}
}

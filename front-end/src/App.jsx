import Header from "./components/Header";
import OptionList from "./components/OptionList";
import { Resizable } from "re-resizable";
import Editor from "./components/Editor";
import Error from "./components/Error";
import LoadingIcon from "./components/LoadingIcon";
import { useEffect, useState, useRef } from "react";
import config from "./config.json";
import { buildYamlCmdString } from "./Yaml&ConfigStuff"
import { Format } from "./API"
import { useCookies } from "react-cookie";
import Popup from 'reactjs-popup';

import { debounce } from "lodash";
import ConfigUiPage from "./components/ConfigUiPage";


const App = () => {
  const [cookie, setCookie] = useCookies([])

  const [configPageOpened, setConfigPageOpened] = useState(false)

  const errorText = useRef("")
  const [activeErrorPopup, setActiveErrorPopup] = useState(false)
  const [darkThemeActive, setDarkThemeActive] = useState(cookie.theme === "dark" || cookie.theme === "light" ? cookie.theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches)
  useEffect(() => { if (darkThemeActive) document.body.className = "dark"; else document.body.className = "" }, [darkThemeActive])
  const [options, setOptions] = useState(
    { selectedVersion: config.Versions.values[0].arg_val_enum.includes(cookie.version) ? cookie.version : config.Versions.values[0].arg_val_enum[0], BasedOnStyle: undefined });
  // code editor text
  const [text, setText] = useState("");
  // autoupdate formatting on option or code change
  const [autoUpdateFormatting, setAutoUpdateFormatting] = useState(true);
  const [currentLang, setCurrentLang] = useState("c_cpp")
  /*
  List of options that were modified manually
  Used to ease removing options, which values match default values fro selected style
  */
  const modifiedOptionTitles = useRef([])
  /*
  Options object with defaults for selected style set, without user input modifications
  */
  const unmodifiedOptions = useRef({})

  function formatCode(options, text, currentLang) {
    const yamlStr = buildYamlCmdString(options, config)
    Format(text, yamlStr, options.selectedVersion, currentLang, (code) => { if (code !== "") { setText(code); window.loadingIcon.setLoadingState("success") } },
      (errortext) => {
        window.loadingIcon.setLoadingState("error")
        errorText.current = errortext
        setActiveErrorPopup(true)
      })
  };

  useEffect(() => { if (autoUpdateFormatting) { formatCode(options, text, currentLang) } }, [text]);

  // Another useeffect for options because of debouncing
  const formatCodeDebounced = useRef(debounce(formatCode, 1000, { leading: false, trailing: true })).current
  useEffect(() => {
    if (autoUpdateFormatting) {
      window.loadingIcon.setLoadingState("loading");
      formatCodeDebounced(options, text, currentLang)
    }
  }, [options]);
  return (
    <div>
      <Header
        autoFormat={autoUpdateFormatting}
        darkTheme={darkThemeActive}
        onDarkThemeChange={() => { const newDarkThemeStatus = !darkThemeActive; setCookie("theme", newDarkThemeStatus ? "dark" : "light", { path: "/" }); setDarkThemeActive(newDarkThemeStatus) }}
        onUpdate={() => { window.loadingIcon.setLoadingState("loading"); formatCode(options, text, currentLang) }}
        onConfigFile={() => { setConfigPageOpened(true) }}
        onAutoFormatChange={setAutoUpdateFormatting}
      />
      <Popup
        className="error_popup"
        open={activeErrorPopup}
        modal={true}
        closeOnEscape={true}
        position="top center"
        closeOnDocumentClick
        onClose={() => setActiveErrorPopup(false)}>
        <Error
          errorText={errorText.current}
        />
      </Popup>
      <Popup
        className="config_page_popup"
        open={configPageOpened}
        onClose={() => setConfigPageOpened(false)}
        modal={true}
        closeOnEscape={false}
        closeOnDocumentClick={false}
        position="center center"
        modifiedOptionTitles={modifiedOptionTitles}
        unmodifiedOptions={unmodifiedOptions}

      >
        <ConfigUiPage
          onClose={() => setConfigPageOpened(false)}
          onLoaded={({ newOptions, _unmodifiedOptions, _modifiedOptionTitles }) => {
            if (newOptions === undefined)
              return
            modifiedOptionTitles.current = _modifiedOptionTitles
            unmodifiedOptions.current = _unmodifiedOptions
            setOptions(newOptions)
            setConfigPageOpened(false)
          }}
          onError={(errorDescription) => {
            errorText.current = errorDescription
            setActiveErrorPopup(true)
          }}
          darkTheme={darkThemeActive}
          options={options}
          modifiedOptionTitles={modifiedOptionTitles}
          unmodifiedOptions={unmodifiedOptions}

        />
      </Popup>

      <div className="pane_container">
        <Resizable
          className="left_side"
          defaultSize={{ width: "45%" }}
          handleStyles={{ bottom: { backgroundColor: "#FF0000" } }}
          enable={{
            top: false,
            right: true,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
        >
          <div className="optionList_container">
            <OptionList
              config={config}
              options={options}
              onFreshGeneratedOptions={(options) => { unmodifiedOptions.current = options }}
              llvmVersionOption={config.Versions}
              onOptionChange={setOptions}
              updateModifiedList={(title) => {
                if (title === undefined)
                  modifiedOptionTitles.current = []
                else {
                  if (!modifiedOptionTitles.current.includes(title)) modifiedOptionTitles.current.push(title)
                }
              }}
            />
          </div>
        </Resizable>
        <section className="right_side">
          <Editor
            setCurrentLang={setCurrentLang}
            currentLang={currentLang}
            onTextChange={setText}
            editorText={text}
            darkTheme={darkThemeActive}
            loadingIcon={<LoadingIcon />}
            columnLimitLine={options.ColumnLimit ? Number(options.ColumnLimit) : 80}
          />

        </section>
      </div>
    </div>
  );
}


export default App;

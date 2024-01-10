import Header from "./components/Header";
import OptionList from "./components/OptionList";
import { Resizable } from "re-resizable";
import Editor from "./components/Editor";
import Error from "./components/Error";
import LoadingIcon from "./components/LoadingIcon";
import { useEffect, useState, useRef } from "react";
import config from "./config.json";
import { buildYamlCmdString, buildYamlConfigFile, loadOptionsFromFile } from "./Yaml&ConfigStuff"
import { Format } from "./API"
import { useCookies } from "react-cookie";
import Popup from 'reactjs-popup';
import { saveAs } from 'file-saver';
import { debounce } from "lodash";


const App = () => {
  const [cookie, setCookie] = useCookies([])

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
    //window.loadingIcon.setLoadingState("loading")
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
        onDownload={() => {
          const conf = buildYamlConfigFile(options, modifiedOptionTitles.current, unmodifiedOptions.current)
          const blob = new Blob([conf], { type: 'text/plain;charset=utf-8' })
          saveAs(blob, ".clang-format")
        }}
        onUpload={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.onchange = (e) => {

            /* 
              SHITCODE WARNING
              Since i use 'modifiedOptionTitles' and 'unmodifiedOptions'
              i have to generate them in 'loadOptionsFromFile' function
            */
            loadOptionsFromFile(e.target.files[0], config, options.selectedVersion,
              (errorDescription) => {
                errorText.current = errorDescription
                setActiveErrorPopup(true)
              },
              ({ newOptions, _unmodifiedOptions, _modifiedOptionTitles }) => {
                if (newOptions === undefined)
                  return
                modifiedOptionTitles.current = _modifiedOptionTitles
                unmodifiedOptions.current = _unmodifiedOptions
                setOptions(newOptions)
              })


          }
          input.click()
        }}
        onAutoFormatChange={setAutoUpdateFormatting}
      />
      <Popup
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
          />

        </section>
      </div>
    </div>
  );
}


export default App;

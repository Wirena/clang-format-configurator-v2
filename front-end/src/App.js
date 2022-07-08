import Header from "./components/Header";
import OptionList from "./components/OptionList";
import { Resizable } from "re-resizable";
import Editor from "./components/Editor";
import Error from "./components/Error";
import { useEffect, useState, useRef } from "react";
import config from "./config.json";
import { buildYamlCmdString } from "./Yaml&ConfigStuff"
import { Format } from "./API"
import Popup from 'reactjs-popup';


const App = () => {

  const formatCode = () => {
    const yamlStr = buildYamlCmdString(options, config)
    Format(text, yamlStr, options.selectedVersion, currentLang, (code) => { if (code !== "") setText(code) },
      (errortext) => {
        setActiveErrorPopup(true)
        errorText.current = errortext
      })
  };
  // text either formatting or file parsing error
  const errorText = useRef("")
  const [activeErrorPopup, setActiveErrorPopup] = useState(false)
  const [options, setOptionsList] = useState(
    { selectedVersion: config.Versions.values[0].arg_val_enum[0], BasedOnStyle: undefined });
  // code editor text
  const [text, setText] = useState("");
  // autoupdate formatting on option or code change
  const [autoUpdateFormatting, setAutoUpdateFormatting] = useState(true);
  const [currentLang, setCurrentLang] = useState("c_cpp")
  /*
  List of options that were modified manually 
  Used to ease removing options, which values match default values fro selected style
  */
  const modifiedOptions= useRef([])

  useEffect(() => { if (autoUpdateFormatting) formatCode(options) }, [text, options]);

  return (
    <div>
      <Header
        autoFormat={autoUpdateFormatting}
        onUpdate={formatCode}
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
          defaultSize={{ width: "50%" }}
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
              llvmVersionOption={config.Versions}
              onOptionChange={setOptionsList}
              updateModifiedList={(title) => {
                if (title === undefined)
                  modifiedOptions.current = []
                else {
                  if (!modifiedOptions.current.includes(title)) modifiedOptions.current.push(title)
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
          />
        </section>
      </div>
    </div>
  );
}


export default App;

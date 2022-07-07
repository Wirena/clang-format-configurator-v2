import Header from "./components/Header";
import OptionList from "./components/OptionList";
import { Resizable } from "re-resizable";
import Editor from "./components/Editor";
import { useEffect, useState } from "react";
import config from "./config.json";
import { buildYamlCmdString } from "./Yaml&ConfigStuff"
import { Format } from "./API"


const App = () => {

  const formatCode = () => {
    const yamlStr = buildYamlCmdString(options, config)
   Format(text, yamlStr, options.selectedVersion, currentLang, (code)=>setText(code), ()=>{console.log("error")})
  };

  const [options, setOptionsList] = useState(
    { selectedVersion: config.Versions.values[0].arg_val_enum[0], BasedOnStyle: undefined });
  const [text, setText] = useState("");
  const [autoUpdateFormatting, setAutoUpdateFormatting] = useState(true);
  const [currentLang, setCurrentLang] = useState("c_cpp")
  /*
  List of options that were modified manually 
  Used to ease removing options, which values match default values fro selected style
  */
  const [modifiedOptions, setModifiedOptions] = useState([])

  useEffect(() => { if (autoUpdateFormatting) formatCode(options) }, [text, options]);
  return (
    <div>
      <Header
        autoFormat={autoUpdateFormatting}
        onUpdate={formatCode}
        onAutoFormatChange={(val) => setAutoUpdateFormatting(val)}
      />
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
                  setModifiedOptions([])
                else setModifiedOptions((arr) => { if (!arr.includes(title)) arr.push(title); return arr })
              }}
            />
          </div>
        </Resizable>
        <section className="right_side">
          <Editor
            setCurrentLang={setCurrentLang}
            currentLang={currentLang}
            onTextChange={(newText) => setText(newText)}
            editorText={text}
          />
        </section>
      </div>
    </div>
  );
}


export default App;

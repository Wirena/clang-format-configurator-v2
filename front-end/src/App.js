import Header from "./components/Header";
import OptionList from "./components/OptionList";
import { Resizable } from "re-resizable";
import Editor from "./components/Editor";
import { useEffect, useState } from "react";
import config from "./config.json";



const App = () => {

  const formatCode = () => {

    console.log(options)
  };

  const [options, setOptionsList] = useState(
    { selectedVersion: config.Versions.values[0].arg_val_enum[0], BasedOnStyle: undefined });
  const [text, setText] = useState("");
  const [autoUpdateFormatting, setAutoUpdateFormatting] = useState(true);

  useEffect(() => { if (autoUpdateFormatting) formatCode(options) }, [text, options]);

  return (
    <div>
      <Header
        autoUpdate={autoUpdateFormatting}
        onUpdate={formatCode}
        onAutoUpdateChange={(val) => setAutoUpdateFormatting(val)}
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
            />
          </div>
        </Resizable>
        <section className="right_side">
          <Editor
            onTextChange={(newText) => setText(newText)}
            editorText={text}
          />
        </section>
      </div>
    </div>
  );
}


export default App;

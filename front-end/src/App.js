import Header from "./components/Header";
import OptionList from "./components/OptionList";
import optionsConfig from "./components/options.json";
import Option from "./components/Option";
import { Resizable } from "re-resizable";
import AceEditor from "react-ace";
import React from "react";

function App() {
  return (
    <div>
      <Header />
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
            <OptionList />
          </div>
        </Resizable>
        <section className="right_side">
          <AceEditor
            mode="java"
            theme="github"
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: true }}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
            }}
          />
        </section>
      </div>
    </div>
  );
}

export default App;

import Header from "./components/Header";
import OptionList from "./components/OptionList";
import { Resizable } from "re-resizable";
import Editor from "./components/Editor";
import Formatter from "./components/Formatter"
import React from "react";
import config from "./config.json";

// Resizing performanse sucks on Firefox redo this later
function App() {
  let formatter;
  const [text, setText] = React.useState()
  //React.useEffect(() => {
  //  formatter = Formatter(() => console.log("helo"), config)
  //}, []);
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
            <OptionList options={config} />
          </div>
        </Resizable>
        <section className="right_side">
          <Editor/>
        </section>
      </div>
    </div>
  );
}

export default App;

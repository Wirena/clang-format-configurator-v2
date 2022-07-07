import React from "react";
import AceEditor from "react-ace";
import styles from './Editor.module.css'
import cppCode from '../code_snippets/cppCode.cpp'
import 'ace-builds/webpack-resolver'
import 'ace-builds/src-noconflict/ext-language_tools'



const Editor = ({ editorText, onTextChange, currentLang, setCurrentLang, ...props }) => {


  const cppCodeString = React.useRef("")

  React.useEffect(() => {
    //Load Cpp snippet
    fetch(cppCode)
      .then((response) => response.text())
      .then((textContent) => {
        cppCodeString.current = textContent;
        onTextChange(cppCodeString.current)
      })
  }, [])

  return (
    <span>
      <button
        className={styles.tab_button}
        onClick={() => {
          onTextChange(cppCodeString.current)
          setCurrentLang("c_cpp")
        }}
      >C++</button>
      <AceEditor
        editorProps={{ $blockScrolling: true }}
        name={styles.ace}
        height={"99%"}
        width={"100%"}
        onChange={onTextChange}
        value={editorText}
        mode={currentLang}
        theme="textmate"
        fontSize={12}

        debounceChangePeriod={1000}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
        }}
      />
    </span>
  )
};

export default Editor
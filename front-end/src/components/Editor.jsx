import React from "react";
import AceEditor from "react-ace";
import styles from './Editor.module.css'
import cppCode from '../code_snippets/cppCode.cpp'
import javaCode from '../code_snippets/javaCode.java'
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/snippets/c_cpp";
import "ace-builds/src-noconflict/snippets/java";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/theme-textmate";
import "ace-builds/src-noconflict/theme-idle_fingers";
import "ace-builds/src-noconflict/ext-language_tools";


const Editor = ({ editorText, onTextChange, currentLang, setCurrentLang, darkTheme }) => {
  const cppCodeString = React.useRef("")
  const javaCodeString = React.useRef("")
  React.useEffect(() => {
    //Load Cpp snippet
    fetch(cppCode)
      .then((response) => response.text())
      .then((textContent) => {
        cppCodeString.current = textContent;
        onTextChange(cppCodeString.current)
      })
    //Load Java snippet
    fetch(javaCode)
      .then((response) => response.text())
      .then((textContent) => {
        javaCodeString.current = textContent;
      })
  }, [])

  return (
    <span>
      <button
        className={styles.tab_button}
        onClick={() => {
          onTextChange(cppCodeString.current)
          setCurrentLang("c_cpp")
        }}>
        C++
      </button>

      <button
        className={styles.tab_button}
        onClick={() => {
          onTextChange(javaCodeString.current)
          setCurrentLang("java")
        }}>
        Java
      </button>
      <AceEditor
        editorProps={{ $blockScrolling: true }}
        name={styles.ace}
        height="97%"
        width={"100%"}
        onChange={onTextChange}
        value={editorText}
        mode={currentLang}
        theme={darkTheme ? "idle_fingers" : "textmate"}
        fontSize={14}
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
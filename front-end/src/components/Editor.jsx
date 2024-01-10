import React from "react";
import { diff as DiffEditor } from "react-ace";
import AceEditor from "react-ace";
import styles from './Editor.module.css'
import cppCode from '../code_snippets/cppCode.cpp'
import javaCode from '../code_snippets/javaCode.java'
import "./ace.css"
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/snippets/c_cpp";
import "ace-builds/src-noconflict/snippets/java";
import "ace-builds/src-noconflict/theme-textmate";
import "ace-builds/src-noconflict/theme-clouds_midnight";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-beautify"
import "ace-builds/src-min-noconflict/ext-searchbox";
import { debounce } from "lodash";


const Editor = ({ editorText, onTextChange, currentLang, setCurrentLang, darkTheme, loadingIcon }) => {
  const cppCodeString = React.useRef("")
  const javaCodeString = React.useRef("")
  const [editorDiffMode, setEditorDiffMode] = React.useState(false)
  const [leftPaneText, setLeftPaneText] = React.useState("")
  const [orientationBeside, setOrientationBeside] = React.useState(true)

  const onTextChangeDiffDebounced = React.useRef(debounce(([leftPaneText, rightPaneText]) => { setLeftPaneText(leftPaneText); onTextChange(leftPaneText) }, 1000, { leading: false, trailing: true }))
  const onTextChangeSingleDebounced = React.useRef(debounce(onTextChange, 1000, { leading: false, trailing: true }))


  React.useEffect(() => {
    //Load Cpp snippet
    fetch(cppCode)
      .then((response) => response.text())
      .then((textContent) => {
        cppCodeString.current = textContent;
        setLeftPaneText(textContent)
        onTextChange(cppCodeString.current)
      })
    //Load Java snippet
    fetch(javaCode)
      .then((response) => response.text())
      .then((textContent) => {
        javaCodeString.current = textContent;
      })
  }, [])

  const editor = (editorDiffMode ? (
    <DiffEditor
      name="Ace Diff editor"
      height="97%"
      width={"100%"}
      editorProps={{ $blockScrolling: true }}
      mode={currentLang}
      theme={darkTheme ? "clouds_midnight" : "textmate"}
      orientation={orientationBeside ? "beside" : "below"}
      fontSize={14}
      debounceChangePeriod={0}
      onChange={([leftPaneText, rightPaneText]) => { window.loadingIcon.setLoadingState("loading"); onTextChangeDiffDebounced.current(leftPaneText, rightPaneText) }}
      value={[leftPaneText || "", editorText || ""]}
      setOptions={{
        useWorker: false,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showGutter: true,
      }}
    />
  ) : (<AceEditor
    editorProps={{ $blockScrolling: true }}
    name="Ace editor"
    height="97%"
    width={"100%"}

    value={editorText}
    mode={currentLang}
    theme={darkTheme ? "clouds_midnight" : "textmate"}
    fontSize={14}
    debounceChangePeriod={0}
    onChange={(text) => { window.loadingIcon.setLoadingState("loading"); onTextChangeSingleDebounced.current(text) }}
    setOptions={{
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
      enableSnippets: true,
    }}
  />))

  return (
    <span>
      <span className={styles.tab_container}>
        <span>
          {loadingIcon}
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
        </span>
        <span>
          {editorDiffMode ? (<button
            className={styles.tab_button}
            onClick={() => { setOrientationBeside(!orientationBeside) }}
          >
            Change Orientation
          </button>) : null}
          <button
            id={styles.mode_button}
            className={styles.tab_button}
            onClick={() => { setEditorDiffMode(!editorDiffMode) }}
          >
            {editorDiffMode ? "Single mode" : "Diff mode"}
          </button>
        </span>
      </span>
      {editor}
    </span>
  )
};

export default Editor
import React from "react";
import AceEditor from "react-ace";
import styles from './Editor.module.css'

const Editor = ({ editorText, onTextChange, ...props }) => {
  return (
    <span>
      <button
        className={styles.tab_button}
        onClick={() => onTextChange('c++')}
      >C++</button>
      <AceEditor
        editorProps={{ $blockScrolling: true }}
        name={styles.ace}
        height={"100%"}
        width={"100%"}
        onChange={onTextChange}
        value={editorText}
        fontSize={16}
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
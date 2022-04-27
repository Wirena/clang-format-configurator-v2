import React from "react";
import AceEditor from "react-ace";

const Editor = (props)=>{
    return (
        <AceEditor
            
            editorProps={{ $blockScrolling: true }}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
            }}
          />
    )
};

export default Editor
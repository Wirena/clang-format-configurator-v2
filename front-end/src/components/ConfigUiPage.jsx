import React from "react";
import AceEditor from "react-ace";
import { saveAs } from 'file-saver';
import styles from "./ConfigUiPage.module.css"
import "./ace.css"
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/snippets/yaml";
import "ace-builds/src-noconflict/theme-textmate";
import "ace-builds/src-noconflict/theme-clouds_midnight";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-beautify"
import "ace-builds/src-min-noconflict/ext-searchbox";
import { buildYamlConfigFile, loadOptionsFromString } from "../Yaml&ConfigStuff"
import config from "../config.json";
import { useCookies } from "react-cookie";



const ConfigUiPage = ({ options, modifiedOptionTitles, unmodifiedOptions, onLoaded, onError, onClose, darkTheme }) => {
    const [cookie, setCookie] = useCookies([])
    const [removeDuplicates, setRemoveDuplicates] = React.useState(cookie["remove-duplicates"] === "true" ? true : false) // bruh

    const [optionsText, setOptionsText] = React.useState(buildYamlConfigFile(options, removeDuplicates, modifiedOptionTitles.current, unmodifiedOptions.current))
    const downloadConfigFile = React.useCallback(() => {
        const blob = new Blob([optionsText], { type: 'text/plain;charset=utf-8' })
        saveAs(blob, ".clang-format")
    }, [optionsText])

    const onUploadFileToStr = React.useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setOptionsText(e.target.result)
            }
            reader.readAsText(e.target.files[0])
        }
        input.click()
    }, [setOptionsText])

    const loadConfigTxtToOptions = React.useCallback((optionsStr) => {
        try {
            loadOptionsFromString(optionsStr, config, options.selectedVersion, onLoaded)
        } catch (err) {
            onError(err.message)
        }
    }, [onError, onLoaded, options.selectedVersion])

    return (
        <div className={styles.config_ui_page}>
            <header className={styles.top_panel}>
                <h2 className={styles.page_title_text}>
                    Edit your .clang-format config file in place or use Upload and Download buttons to open File Explorer
                </h2>
            </header>
            <div className={styles.middle_panel}>
                <div className={styles.editor_container}>
                    <AceEditor
                        value={optionsText}
                        onChange={setOptionsText}
                        width={"100%"}
                        height={"100%"}
                        mode={"yaml"}
                        fontSize={14}
                        showPrintMargin={false}
                        theme={darkTheme ? "clouds_midnight" : "textmate"}
                        setOptions={{
                            useWorker: false,
                            enableBasicAutocompletion: true,
                            enableLiveAutocompletion: true,
                            enableSnippets: true,
                        }}
                    />
                </div>
            </div>
            <footer className={styles.bottom_panel}>
                <div className={styles.bottom_config_options}>
                    <input type="checkbox"
                        label="Remove duplicates"
                        checked={removeDuplicates}
                        id="remove-duplicates"
                        onChange={() => {
                            setCookie("remove-duplicates", !removeDuplicates);
                            setRemoveDuplicates(!removeDuplicates);
                            setOptionsText(buildYamlConfigFile(options, !removeDuplicates, modifiedOptionTitles.current, unmodifiedOptions.current))
                        }} />{" "}
                    <label
                        htmlFor="remove-duplicates"
                        className={styles.config_option_description}>Remove duplicates with BasedOnStyle (Not tested)</label>
                </div>

                <span className={styles.bottom_file_buttons}>
                    <button onClick={onUploadFileToStr}>
                        Upload file
                    </button>
                    <button
                        onClick={downloadConfigFile}>
                        Download file
                    </button>
                </span>
                <span className={styles.bottom_control_buttons}>
                    <button onClick={onClose}>
                        Close
                    </button>
                    <button onClick={() => { loadConfigTxtToOptions(optionsText) }}>
                        Load Config
                    </button>
                </span>

            </footer>
        </div>

    )

};

export default ConfigUiPage;

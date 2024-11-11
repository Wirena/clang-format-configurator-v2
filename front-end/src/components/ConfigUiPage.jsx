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
import { buildYamlConfigFile, loadOptionsFromString, convertLegacyAlignConsectutiveOptions, ValidationError } from "../Yaml&ConfigStuff"
import config from "../config.json";
import { useCookies } from "react-cookie";



const ConfigUiPage = ({ options, modifiedOptionTitles, unmodifiedOptions, onLoaded, onError, onClose, darkTheme }) => {
    const [cookie, setCookie] = useCookies([])
    const [removeDuplicates, setRemoveDuplicates] = React.useState(cookie["remove-duplicates"] === "true" ? true : false) // bruh

    const [showAlignConsecutiveErrPage, setShowAlignConsecuriveErrPage] = React.useState(false)

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
            loadOptionsFromString(optionsStr, config, options.selectedVersion, (res) => {
                onLoaded(res)
            })
        } catch (err) {
            if (err instanceof ValidationError) {
                setShowAlignConsecuriveErrPage(true)
            } else
                onError(err.message)
        }
    }, [onError, onLoaded, options.selectedVersion, setShowAlignConsecuriveErrPage])
    if (showAlignConsecutiveErrPage)
        return (<div className={styles.aligncons_error_ui_page}>
            <h1 className={styles.aligncons_error_main_msg}>
                Failed to load config
            </h1>
            <h3 className={styles.aligncons_error_detailed_msg}>
                {/* Bruh */}
                {"Legacy values "} <code>None</code>{", "} <code>Consecutive</code>{", "} <code>AcrossEmptyLines</code>{", "}<code>AcrossComments</code>{", "}
                <code>AcrossEmptyLinesAndComments</code>{" or booleans for "}<code>AlignConsecutive*</code>{" options are not supported for clang-format versions >=15.0"}
            </h3>
            <details className={styles.aligncons_error_spoiler}>
                <summary className={styles.aligncons_error_spoiler_summary}>More info</summary>
                <h3 className={styles.aligncons_error_spoiler_content}>
                    {"Since version 15.0 clang-format "}
                    <a target={"_blank"} rel={"noreferrer"}
                        href={"https://releases.llvm.org/16.0.0/tools/clang/docs/ClangFormatStyleOptions.html#alignconsecutiveassignments"}>{"reads"}</a>{" "}<code>AlignConsecutive*</code>
                    {" options both as a list of nested flags, which was added to improve flexibility, and "}
                    {"as a single value for compatibility with older config files."}
                </h3>
                <h3 className={styles.aligncons_error_spoiler_content}>
                    {"For example, these three snippets are valid and describe the same style"}
                </h3>
                <ul className={styles.aligncons_error_spoiler_code_snippets_list}>
                    <li><pre className={styles.aligncons_error_spoiler_code_snippet} lang="yaml">
                        {`AlignConsecutiveMacros: Consecutive`}
                    </pre></li>
                    <li><pre className={styles.aligncons_error_spoiler_code_snippet} lang="yaml">
                        {`AlignConsecutiveMacros: true`}
                    </pre></li>
                    <li><pre className={styles.aligncons_error_spoiler_code_snippet} lang="yaml">
                        {/* Bruh */
                            `AlignConsecutiveMacros:
    Enabled: true
    AcrossEmptyLines: false
    AcrossComments: false
    AlignCompound: false
    AlignFunctionPointers: false
    PadOperators: true`}
                    </pre></li>
                </ul>
                <h3 className={styles.aligncons_error_spoiler_content}>
                    {"So, due to technical reasons"}<label className={styles.aligncons_error_shitcode_msg}>{" (utter shitcode), "}</label>
                    {"this configurator does not support the first two ways of setting AlignConsecutive options, the third one works fine"}
                </h3>
                <h3 className={styles.aligncons_error_spoiler_content}>
                    {"Conversion to modern style is done according to "}
                    <a target={"_blank"} rel={"noreferrer"}
                        href={"https://github.com/llvm/llvm-project/blob/llvmorg-18.1.8/clang/lib/Format/Format.cpp#L73-L112"}
                    >{"this"}</a>{" piece of code from LLVM repo"}
                </h3>

            </details>
            <h2 className={styles.aligncons_error_convert_prompt}>
                Convert legacy values to modern style?
            </h2>
            <div className={styles.aligncons_error_button_container}>
                <button onClick={() => {
                    const newOptionsText = convertLegacyAlignConsectutiveOptions(optionsText, parseInt(options.selectedVersion));
                    setOptionsText(newOptionsText);
                    loadConfigTxtToOptions(newOptionsText);
                    setShowAlignConsecuriveErrPage(false);
                }}>
                    Ok
                </button>
                <button onClick={() => setShowAlignConsecuriveErrPage(false)}>Cancel</button>
            </div>
        </div>)
    else
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
            </div >

        )


};

export default ConfigUiPage

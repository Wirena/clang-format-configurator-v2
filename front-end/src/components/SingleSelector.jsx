import React from "react";
import styles from "./Selector.module.css";



// used for simple values like string, int, bool etc
const SingleSelector = ({ selectionInfo, onChange, currentStyle, currentOptionValue }) => {
  const onChangeFunc = (event) => onChange(event.target.value)
  const defValue =
    selectionInfo.defaults[currentStyle] === undefined
      ? undefined
      : selectionInfo.defaults[currentStyle].value;

  switch (selectionInfo.argument_type) {
    case "unsigned":
    case "int":
      return (<div>
        <input
          type="number"
          className={styles.selector}
          placeholder={defValue || ""}
          onChange={onChangeFunc}
          value={currentOptionValue || ""}
        />
      </div>
      );
    case "bool":
      return (
        <div>
          <select
            value={currentOptionValue == undefined ? "" : currentOptionValue}
            className={styles.selector}
            onChange={(event) => {
              let val = event.target.value
              if (val === "true")
                val = true
              else if (val === "false")
                val = false
              onChange(val)
            }}>
            <option key={0}></option>
            <option
              key={1}
              value={true}
              className={true === defValue ? styles.dropdownOptionDefault : null}>
              true
            </option>
            <option
              key={2}
              value={false}
              className={false === defValue ? styles.dropdownOptionDefault : null}>
              false
            </option>
          </select>
        </div>
      );
    case "std::string":
      return (
        <div>
          <input
            type="text"
            className={styles.selector}
            placeholder={defValue}
            value={currentOptionValue || ""}
            onChange={onChangeFunc} />
        </div>
      );
    default:
      return (
        <div>
          <select
            value={currentOptionValue || ""}
            className={styles.selector}
            onChange={onChangeFunc}>
            {selectionInfo.arg_val_enum.map((value) => (
              <option
                key={value}
                className={value === defValue ? styles.dropdownOptionDefault : null}>
                {value}
              </option>
            ))}
          </select>
        </div>
      );
  }
};


export default SingleSelector;

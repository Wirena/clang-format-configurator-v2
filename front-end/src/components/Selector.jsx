import React from "react";
import styles from "./Selector.module.css";
const Selector = ({
  selectionInfo,
  onChange,
  currentStyle,
  selectedValue,
  ...props
}) => {
  let input = {};

  const defValue =
    selectionInfo.defaults[currentStyle] === undefined
      ? undefined
      : selectionInfo.defaults[currentStyle].value;
  switch (selectionInfo.argument_type) {
    case "unsigned":
    case "int":
      input = (
        <input
          className={styles.selector}
          placeholder={defValue || ""}
          onChange={onChange}
          value={selectedValue || ""}
        />
      );
      break;
    case "bool":
      input = (
        <select
          onChange={onChange}
          value={selectedValue}
          className={styles.selector}
        >
          <option key={0}></option>
          <option
            key={1}
            className={true === defValue ? styles.dropdownOptionDefault : null}
          >
            true
          </option>
          <option
            key={2}
            className={false === defValue ? styles.dropdownOptionDefault : null}
          >
            false
          </option>
        </select>
      );
      break;
    case "std::string":
      input = (
        <input
          type="text"
          onChange={onChange}
          className={styles.selector}
          placeholder={defValue}
          value={selectedValue}
        />
      );
      break;
    default:
      input = (
        <select
          value={selectedValue}
          className={styles.selector}
          onChange={onChange}
        >
          {selectionInfo.arg_val_enum.map((value) => (
            <option
              key={value}
              className={
                value === defValue ? styles.dropdownOptionDefault : null
              }
            >
              {value}
            </option>
          ))}
        </select>
      );
  }
  return <div>{input}</div>;
};

export default Selector;

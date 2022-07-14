import React from "react";
import styles from "./Selector.module.css";
import Popup from "reactjs-popup"
import 'reactjs-popup/dist/index.css';



// used for simple values like string, int, bool etc
const SingleSelector = ({ selectorInfo, onChange, defaultValue,
  currentOptionValue, notDisableable }) => {
  const defValue =
    defaultValue === undefined
      ? undefined
      : defaultValue.value;

  switch (selectorInfo.argument_type) {
    case "unsigned":
    case "int":
      return (<div>
        <input
          type="number"
          className={styles.selector}
          placeholder={defValue === undefined ? "" : defValue}
          onChange={(event) => {
            onChange(event.target.value === "" ?
              undefined : parseInt(event.target.value))
          }}
          value={currentOptionValue === undefined ? "" : currentOptionValue}
        />
      </div>
      );
    case "bool":
      return (
        <div>
          <select
            value={currentOptionValue === undefined ?
              "" : currentOptionValue}
            className={styles.selector}
            onChange={(event) => {
              let val = event.target.value
              if (val === "true")
                val = true
              else if (val === "false")
                val = false
              else
                val = undefined
              onChange(val)
            }}>
            <option key={0}></option>
            <option
              key={1}
              value={true}
              className={true === defValue ?
                styles.dropdown_option_default : null}>
              true
            </option>
            <option
              key={2}
              value={false}
              className={false === defValue ?
                styles.dropdown_option_default : null}>
              false
            </option>
          </select>
        </div>
      );
    case "std::string":
      if (notDisableable)
        return (
          <div>
            <input
              type="text"
              className={styles.selector}
              placeholder={defValue}
              value={currentOptionValue || ""}
              onChange={(event) => onChange(event.target.value)} />
          </div>
        )
      return (
        <div>
          <input
            type="text"
            className={[styles.selector,
            styles.selector_disableable].join(' ')}
            placeholder={currentOptionValue === undefined ?
              "Undefined" : defValue}
            disabled={currentOptionValue === undefined}
            value={currentOptionValue || ""}
            onChange={(event) => onChange(event.target.value)} />


          <Popup
            trigger={
              <button
                onClick={() => {
                  /*
                  on button click swap activeness state
                  If current value is undefined then activate option
                  by set empty string as new value
                  else deactivate it and set "undefined"
                  */
                  onChange(currentOptionValue === undefined ?
                    "" : undefined
                  )
                }}
                className={styles.button_activeness}>
                <img
                  alt={currentOptionValue === undefined ?
                    "option inactive" : "option active"}
                  src={currentOptionValue === undefined ?
                    "./inactiveFieldIcon.svg" : "./activeFieldIcon.svg"}
                ></img>
              </button>
            }
            on={['hover']}
            position="right center" closeOnDocumentClick>
            <span> {currentOptionValue === undefined ? "Activate Option" : "Set value to undefined"} </span>
          </Popup>

        </div>
      );
    default:
      return (
        <div>
          <select
            value={currentOptionValue || ""}
            className={styles.selector}
            onChange={(event) => {
              if (event.target.value === "")
                onChange(undefined)
              else
                onChange(event.target.value)
            }}>
            {selectorInfo.arg_val_enum.map((value) => (
              <option
                key={value}
                className={value === defValue ? styles.dropdown_option_default : null}>
                {value}
              </option>
            ))}
          </select>
        </div>
      );
  }
};


export default SingleSelector;

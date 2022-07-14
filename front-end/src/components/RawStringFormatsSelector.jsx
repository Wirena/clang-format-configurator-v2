import React from "react";
import styles from "./Selector.module.css";
import SingleSelector from "./SingleSelector";
import ArraySelector from "./ArraySelector";

const RawStringFormatsSelector = ({ selectorInfo, onChange, currentStyle,
  currentOptionValue }) => {
  return (
    <div key={selectorInfo.title}
      className={styles.nested_container}>
      <div className={styles.title_nested}>Language</div>
      <SingleSelector
        selectorInfo={{ argument_type: "std::string" }}
        currentOptionValue={currentOptionValue.Language}
        defaultValue={selectorInfo.defaults[currentStyle]}
        onChange={(newValue) => {
          let val = { ...currentOptionValue }
          val.Language = newValue
          onChange(val)
        }}
      />
      <div className={styles.title_nested}>EnclosingFunctions</div>
      <ArraySelector
        selectorInfo={{
          title: "EnclosingFunctions", argument_type: "std::string",
          defaults: selectorInfo.defaults
        }}
        onChange={(newValue) => {
          let val = { ...currentOptionValue }
          val.EnclosingFunctions = newValue
          onChange(val)
        }}
        currentOptionValue={currentOptionValue.EnclosingFunctions}
        currentStyle={currentStyle}
      />
      <div className={styles.title_nested}>BasedOnStyle</div>
      <SingleSelector
        selectorInfo={{ argument_type: "std::string" }}
        currentOptionValue={currentOptionValue.BasedOnStyle}
        defaultValue={selectorInfo.defaults[currentStyle]}
        currentStyle={currentStyle}
        onChange={(newValue) => {
          let val = { ...currentOptionValue }
          val.BasedOnStyle = newValue
          onChange(val)
        }}
      />
      <div className={styles.title_nested}>Delimeters</div>
      <ArraySelector
        selectorInfo={{
          title: "Delimeters", argument_type: "std::string",
          defaults: selectorInfo.defaults
        }}
        onChange={(newValue) => {
          let val = { ...currentOptionValue }
          val.Delimiters = newValue
          onChange(val)
        }}
        currentOptionValue={currentOptionValue.Delimiters}
        currentStyle={currentStyle}
      />
      <div className={styles.title_nested}>CanonicalDelimiter</div>
      <SingleSelector
        selectorInfo={{ argument_type: "std::string" }}
        currentOptionValue={currentOptionValue.CanonicalDelimiter}
        defaultValue={selectorInfo.defaults[currentStyle]}
        currentStyle={currentStyle}
        onChange={(newValue) => {
          let val = { ...currentOptionValue }
          val.CanonicalDelimiter = newValue
          onChange(val)
        }}
      />

    </div>)
}

export default RawStringFormatsSelector;
import React from "react";
import styles from "./Selector.module.css";
import SingleSelector from "./SingleSelector";


const IncludeCategoriesSelector = ({ selectorInfo, onChange, currentStyle,
  currentOptionValue }) => {
  return (
    <div key={selectorInfo.title}
      className={styles.nested_container}>
      <div>Regex</div>
      <SingleSelector
        selectorInfo={{ argument_type: "std::string" }}
        currentOptionValue={currentOptionValue.Regex}
        defaultValue={selectorInfo.defaults[currentStyle]}
        onChange={(newValue) => {
          let val = { ...currentOptionValue }
          val.Regex = newValue
          onChange(val)
        }}
      />
      <div>Priority</div>
      <SingleSelector
        selectorInfo={{ argument_type: "int" }}
        currentOptionValue={currentOptionValue.Priority}
        defaultValue={selectorInfo.defaults[currentStyle]}
        onChange={(newValue) => {
          let val = { ...currentOptionValue }
          val.Priority = newValue
          onChange(val)
        }}
      />
      <div>CaseSensitive</div>
      <SingleSelector
        selectorInfo={{ argument_type: "bool" }}
        currentOptionValue={currentOptionValue.CaseSensitive}
        defaultValue={selectorInfo.defaults[currentStyle]}
        onChange={(newValue) => {
          let val = { ...currentOptionValue }
          val.CaseSensitive = newValue
          onChange(val)
        }}
      />
      <div>SortPriority</div>
      <SingleSelector
        selectorInfo={{ argument_type: "int" }}
        currentOptionValue={currentOptionValue.SortPriority}
        defaultValue={selectorInfo.defaults[currentStyle]}
        onChange={(newValue) => {
          let val = { ...currentOptionValue }
          val.SortPriority = newValue
          onChange(val)
        }}
      />


    </div>)
}


export default IncludeCategoriesSelector;
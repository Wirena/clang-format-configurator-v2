import React from "react";
import styles from "./Selector.module.css";
import SingleSelector from "./SingleSelector";

const MapSelector = ({ selectorInfo, onChange, currentStyle, currentOptionValue }) => {
  const currentOptionValueDefined = currentOptionValue != undefined;

  return (
    <span className={styles.nested_container}>
      {selectorInfo.map((value) => {
        return (
          <div key={value.title}>
            <span className={styles.title_nested}>{value.title}</span>
            <SingleSelector
              selectorInfo={value}
              onChange={(changedValue) => {
                let newOptionValue = currentOptionValueDefined ? currentOptionValue : {}
                newOptionValue[value.title] = changedValue;
                onChange(newOptionValue)
              }}
              currentOptionValue={currentOptionValueDefined ? currentOptionValue[value.title] : ""}
              currentStyle={currentStyle}
            />
          </div>)
      })}
    </span>
  )
}

export default MapSelector;


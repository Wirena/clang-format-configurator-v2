import React from "react";
import styles from "./Selector.module.css";
import SingleSelector from "./SingleSelector";
import RawStringFormatsSelector from "./RawStringFormatsSelector"
import IncludeCategoriesSelector from "./IncludeCategoriesSelector";

const ArraySelector = ({ selectorInfo, onChange, currentStyle, currentOptionValue }) => {
  const defaultValue = selectorInfo.defaults[currentStyle] === undefined ?
    undefined : selectorInfo.defaults[currentStyle].value

  if (currentOptionValue === undefined) currentOptionValue = []
  return (
    <span>
      {currentOptionValue.map((value, index) => {
        let element = {}
        switch (selectorInfo.argument_type) {
          case "std::vector<RawStringFormat>":
            element = (<RawStringFormatsSelector
              selectorInfo={selectorInfo}
              defaultValue={defaultValue}
              currentOptionValue={value}
              onChange={(newValue) => {
                let newOptValue = [...currentOptionValue]
                newOptValue[index] = newValue;
                onChange(newOptValue)
              }}
            />)
            break
          case "std::vector<IncludeCategory>":
            element = (<IncludeCategoriesSelector
              selectorInfo={selectorInfo}
              defaultValue={defaultValue}
              currentOptionValue={value}
              onChange={(newValue) => {
                let newOptValue = [...currentOptionValue]
                newOptValue[index] = newValue;
                onChange(newOptValue)
              }}
            />)
            break
          default:
            element = <SingleSelector
              selectorInfo={{ ...selectorInfo, argument_type: "std::string" }}
              defaultValue={defaultValue}
              currentOptionValue={value}
              notDisableable={true}
              onChange={(newValue) => {
                let newOptValue = [...currentOptionValue]
                newOptValue[index] = newValue;
                onChange(newOptValue)
              }}
            />
            break
        }
        return (
          <div key={selectorInfo.title + index}>
            {element}
            <button
              className={styles.button_array}>
              <img
                className={styles.image_button_array}
                src="./deleteIcon.svg"
                alt="Delete array element"
                onClick={() => {
                  if (currentOptionValue.length === 1)
                    onChange(undefined)
                  else
                    onChange(currentOptionValue.filter((val, filterIndex) =>
                      index !== filterIndex))
                }}
              />
            </button>
          </div>
        )
      })}
      <button
        className={styles.button_array}>
        <img
          className={styles.image_button_array}
          src="./addIcon.svg"
          alt="Add element to array"
          onClick={() => {
            if (currentOptionValue === undefined)
              onChange([""])
            else {
              const newArr = [...currentOptionValue]
              newArr.push("")
              onChange(newArr)
            }

          }}
        />
      </button>
    </span>
  )

}

export default ArraySelector;

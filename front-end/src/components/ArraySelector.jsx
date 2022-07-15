import React from "react";
import styles from "./Selector.module.css";
import SingleSelector from "./SingleSelector";
import RawStringFormatsSelector from "./RawStringFormatsSelector"
import IncludeCategoriesSelector from "./IncludeCategoriesSelector";
import Popup from "reactjs-popup"


const ArraySelector = ({ selectorInfo, onChange, currentStyle, currentOptionValue }) => {
  const defaultValue = selectorInfo.defaults[currentStyle] === undefined ?
    undefined : selectorInfo.defaults[currentStyle].value

  if (currentOptionValue === undefined)
    return (
      <span>
        <Popup
          mouseEnterDelay={1000}
          trigger={
            <button
              className={styles.button_array}>
              <img
                className={styles.image_button_array}
                src="./activateArrayIcon.svg"
                alt="Activate array option"
                onClick={() => {
                  onChange([])
                }}
              />
            </button>
          }
          on={['hover']}
          position="right center" closeOnDocumentClick>
          <span className={styles.popup_hint}> {"Activate Option"} </span>
        </Popup>
      </span>
    )
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
            <Popup
              mouseEnterDelay={1000}
              trigger={
                <button
                  className={styles.button_array}>
                  <img
                    className={styles.image_button_array}
                    src="./deleteIcon.svg"
                    alt="Delete array element"
                    onClick={() => {
                      if (currentOptionValue.length === 1)
                        onChange([])
                      else
                        onChange(currentOptionValue.filter((val, filterIndex) =>
                          index !== filterIndex))
                    }}
                  />
                </button>
              }
              on={['hover']}
              position="right center" closeOnDocumentClick>
              <span className={styles.popup_hint}> {"Delete array element"} </span>
            </Popup>
          </div>
        )
      })}
      <Popup
        mouseEnterDelay={1000}
        trigger={
          <button
            className={styles.button_array}>
            <img
              className={styles.image_button_array}
              src="./addIcon.svg"
              alt="Add element to the array"
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
        }
        on={['hover']}
        position="right center" closeOnDocumentClick>
        <span className={styles.popup_hint}> {"Add element to the array"} </span>
      </Popup>

      {currentOptionValue.length === 0 ?
        <Popup
          mouseEnterDelay={1000}
          trigger={
            <button
              className={styles.button_array}>
              <img
                className={styles.image_button_array}
                src="./deactivateArrayIcon.svg"
                alt="Deactivate array options"
                onClick={() => {
                  onChange(undefined)
                }}
              />
            </button>
          }
          on={['hover']}
          position="right center" closeOnDocumentClick>
          <span className={styles.popup_hint}> {"Set value no undefined"} </span>
        </Popup>
        : undefined}
    </span>
  )
}

export default ArraySelector;

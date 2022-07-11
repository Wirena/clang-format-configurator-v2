import React from "react";
import Option from "./Option";
import { cloneDeep } from "lodash";

const OptionList = ({ config, options, llvmVersionOption, onOptionChange, updateModifiedList, onFreshGeneratedOptions }) => {

  return (
    <div className="OptionList">
      <Option //LLVM version option
        key="LLVM Version"
        optionInfo={llvmVersionOption}
        currentOptionValue={options.selectedVersion}
        onChange={(optionTitle, newSelectedVersion) => {
          // clear all selected options and update version field
          updateModifiedList(undefined)
          const opts = { selectedVersion: newSelectedVersion }
          onFreshGeneratedOptions(opts)
          onOptionChange(opts)
        }
        }
      />
      <hr />
      <Option //BasedOnStyle option
        key={config[options.selectedVersion][0].title}
        optionInfo={config[options.selectedVersion][0]}
        currentOptionValue={options.BasedOnStyle}
        onChange={(optionTitle, newOptionValue) => {
          updateModifiedList(undefined)
          /* if empty style selected, clear all options
            else set all option values to defaults  */
          if (newOptionValue === "") {
            const opts = {
              selectedVersion: options.selectedVersion,
              BasedOnStyle: undefined
            }
            onFreshGeneratedOptions(opts)
            onOptionChange(opts)
            return;
          }

          let st = {
            selectedVersion: options.selectedVersion,
            BasedOnStyle: newOptionValue
          }
          config[st.selectedVersion]
            .slice(1).forEach((option) => {
              if (
                option.values.length === 1 &&
                option.values[0].defaults[newOptionValue] !== undefined
              ) {
                st[option.title] =
                  option.values[0].defaults[newOptionValue].value;
              } else {
                // set all option values to selected style defaults
                // inluding nested ones
                // filter out options without defaults for this style
                option.values.filter((element) => element.defaults[newOptionValue] !== undefined)
                  .forEach((nestedOption) => {
                    if (st[option.title] == undefined)
                      st[option.title] = {}
                    st[option.title][nestedOption.title] =
                      nestedOption.defaults[newOptionValue].value
                  }
                  );
              }
            });
          onFreshGeneratedOptions(cloneDeep(st))
          onOptionChange(st);
        }}
      />
      {config[options.selectedVersion].slice(1).map((option) => (
        <Option
          key={option.title}
          optionInfo={option}
          currentStyle={options.BasedOnStyle}
          currentOptionValue={options[option.title]}
          onChange={(optionTitle, newOptionValue) => {
            updateModifiedList(optionTitle)
            onOptionChange({
              ...options,
              [optionTitle]: newOptionValue
            })
          }
          }
        />
      ))}
    </div>
  )

}



export default OptionList;

import React from "react";
import Option from "./Option";
import { cloneDeep } from "lodash";
import { useCookies } from "react-cookie";

const OptionList = ({ config, options, llvmVersionOption, onOptionChange, updateModifiedList, onFreshGeneratedOptions }) => {
  const [_, setCookie] = useCookies([]); // ultra mega bruh

  const deprecatedOptions = []
  const nonDeprecatedOptions = config[options.selectedVersion].slice(1).map((option) => {

    const checkIfOverridden = (currentOptionName, options) => {
      switch (currentOptionName) {
        case "BraceWrapping":
          if (options["BreakBeforeBraces"] !== "Custom")
            return "BreakBeforeBraces"
          else
            return undefined
        case "SpaceBeforeParensOptions":
          if (options["SpaceBeforeParens"] !== "Custom")
            return "SpaceBeforeParens"
          else
            return undefined
        default: return undefined
      }
    }

    const optionWgt = (<Option
      key={option.title}
      optionInfo={option}
      currentStyle={options.BasedOnStyle}
      overridenBy={checkIfOverridden(option.title, options)}
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
    )
    if (option.deprecated) {
      deprecatedOptions.push(optionWgt)
      return []
    }
    return optionWgt
  })


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
          setCookie("version", newSelectedVersion, { path: "/" })
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

          let optionsStateTemplate = {
            selectedVersion: options.selectedVersion,
            BasedOnStyle: newOptionValue
          }
          config[optionsStateTemplate.selectedVersion]
            .slice(1).forEach((option) => {
              if (
                option.values.length === 1 &&
                option.values[0].defaults[newOptionValue] !== undefined
              ) {
                optionsStateTemplate[option.title] =
                  option.values[0].defaults[newOptionValue].value;
              } else {
                // set all option values to selected style defaults
                // inluding nested ones
                // filter out options without defaults for this style
                option.values.filter((element) => element.defaults[newOptionValue] !== undefined)
                  .forEach((nestedOption) => {
                    if (optionsStateTemplate[option.title] == undefined)
                      optionsStateTemplate[option.title] = {}
                    optionsStateTemplate[option.title][nestedOption.title] =
                      nestedOption.defaults[newOptionValue].value
                  }
                  );
              }
            });
          onFreshGeneratedOptions(cloneDeep(optionsStateTemplate))
          onOptionChange(optionsStateTemplate);
        }}
      />
      {nonDeprecatedOptions}
      {deprecatedOptions}
    </div>
  )

}



export default OptionList;

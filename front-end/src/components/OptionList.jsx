import React from "react";
import Option from "./Option";

const OptionList = ({ config, options,llvmVersionOption, onOptionChange }) => {

  return (
    <div className="OptionList">
      <Option //LLVM version option
        key="LLVM Version"
        optionInfo={llvmVersionOption}
        currentOptionValue={options.selectedVersion}
        onChange={(optionTitle, newSelectedVersion) =>
          // clear all selected options and update version field
          onOptionChange({ selectedVersion: newSelectedVersion })
        }
      />
      <hr />
      <Option //BasedOnStyle option
        key={config[options.selectedVersion][0].title}
        optionInfo={config[options.selectedVersion][0]}
        currentOptionValue={options.BasedOnStyle}
        onChange={(optionTitle, newOptionValue) => {
          /* if empty style selected, clear all options
            else set all option values to defaults  */
          if (newOptionValue == "") {
            onOptionChange({
              selectedVersion: options.selectedVersion,
              BasedOnStyle: undefined
            })
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
          onOptionChange(st);
        }}
      />
      {config[options.selectedVersion].slice(1).map((option) => (
        <Option
          key={option.title}
          optionInfo={option}
          currentStyle={options.BasedOnStyle}
          currentOptionValue={options[option.title]}
          onChange={(optionTitle, newOptionValue) => 
            onOptionChange({
              ...options,
              [optionTitle]: newOptionValue
            })
          }
        />
      ))}
    </div>
  )

}





/*
class OptionList extends React.Component {
  state = {
    selectedVersion: "",
    chosenOptions: { BasedOnStyle: undefined },
  };

  constructor(props) {
    super(props);
    this.onOptionChange = props.onOptionChange
    this.config = props.options
    this.sortedVersions = Object.keys(this.config).sort(
      (a, b) => parseInt(b.split("-")[2]) - parseInt(a.split("-")[2])
    );
    this.state.selectedVersion = this.sortedVersions[0];
    this.llvmVersionOption.values[0].arg_val_enum = this.sortedVersions;
  }

  llvmVersionOption = {
    title: "Version",
    docstring: "LLVM Version",
    values: [
      {
        title: "Version",
        argument_type: "",
        arg_val_enum: this.sortedVersions,
        defaults: {},
      },
    ],
  };

  render() {

    return (
      <div className="OptionList">
        <Option //LLVM version option
          key="LLVM Version"
          optionInfo={this.llvmVersionOption}
          currentOptionValue={this.state.selectedVersion}
          onChange={(optionTitle, newOptionValue) =>
            // clear all selected option and update version field
            this.setState({ chosenOptions: {}, selectedVersion: newOptionValue })
          }
        />
        <hr />
        <Option //BasedOnStyle option
          key={this.config[this.state.selectedVersion][0].title}
          optionInfo={this.config[this.state.selectedVersion][0]}
          currentOptionValue={this.state.chosenOptions.BasedOnStyle}
          onChange={(optionTitle, newOptionValue) => {
            /* if empty style selected, clear all options
              else set all option values to defaults  
            if (newOptionValue == "" || newOptionValue === undefined) {
              this.setState({ chosenOptions: {} });
              return;
            }

            let st = { selectedVersion: this.state.selectedVersion, chosenOptions: { BasedOnStyle: newOptionValue } }
            this.config[this.state.selectedVersion]
              .slice(1).forEach((option) => {
                if (
                  option.values.length === 1 &&
                  option.values[0].defaults[newOptionValue] !== undefined
                ) {
                  st.chosenOptions[option.title] =
                    option.values[0]["defaults"][newOptionValue].value;
                } else {
                  // set all option values to selected style defaults
                  // inluding nested ones
                  // filter out options without defaults for this style
                  option.values.filter((element) => element.defaults[newOptionValue] !== undefined)
                    .forEach((nestedOption) => {
                      if (st.chosenOptions[option.title] == undefined)
                        st.chosenOptions[option.title] = {}
                      st.chosenOptions[option.title][nestedOption.title] =
                        nestedOption.defaults[newOptionValue].value
                    }
                    );
                }
              });
            this.setState(st);
            this.onOptionChange(st.chosenOptions);
          }}
        />
        {this.config[this.state.selectedVersion].slice(1).map((option) => (
          <Option
            key={option.title}
            optionInfo={option}
            currentStyle={this.state.chosenOptions.BasedOnStyle}
            currentOptionValue={this.state.chosenOptions[option.title]}
            onChange={(optionTitle, newOptionValue) => {
              let st = this.state;
              st.chosenOptions[optionTitle] = newOptionValue;
              this.setState(st);
              this.onOptionChange();
            }}
          />
        ))}
      </div>
    );
  }
}
*/
export default OptionList;

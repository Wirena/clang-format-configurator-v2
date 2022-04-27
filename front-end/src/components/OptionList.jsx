import React from "react";
import Option from "./Option";

class OptionList extends React.Component {
  state = {
    selectedVersion: "",
    chosenOptions: { BasedOnStyle: undefined },
  };

  constructor(props) {
    super(props);
    this.sourceOptionList = props.options
    this.sortedVersions = Object.keys(this.sourceOptionList).sort(
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
          option={this.llvmVersionOption}
          selected={this.state.selectedVersion}
          onChange={({ newValue } = {}) => {
            // clear all selected option and update version field
            this.setState({ chosenOptions: {} });
            this.setState({
              selectedVersion: newValue,
            });
            console.log(newValue);
          }}
        />
        <hr />
        {/*BasedOnStyle option */}
        <Option
          key={this.sourceOptionList[this.state.selectedVersion][0].title}
          option={this.sourceOptionList[this.state.selectedVersion][0]}
          selected={this.state.chosenOptions.BasedOnStyle}
          onChange={({ newValue } = {}) => {
            /*  if empty selected, clear all options
                            else set all option values to defaults
                        */

            if (newValue == "" || newValue === undefined) {
              this.setState({ chosenOptions: {} });
              return;
            }
            let st = this.state;
            st.chosenOptions.BasedOnStyle = newValue;
            this.sourceOptionList[this.state.selectedVersion]
              .slice(1)
              .forEach((option) => {
                if (
                  option.values.length === 1 &&
                  option.values[0].defaults[newValue] !== undefined
                ) {
                  st.chosenOptions[option.title] =
                    option.values[0]["defaults"][newValue].value;
                } else {
                  // set all option values to selected style defaults
                  // inluding nested ones
                  st.chosenOptions[option.title] = {};
                  option.values
                    .filter(
                      //filter out options without defaults for this style
                      (element) => element.defaults[newValue] !== undefined
                    )
                    .forEach(
                      (nestedOption) =>
                        (st.chosenOptions[option.title][nestedOption.title] =
                          nestedOption.defaults[newValue].value)
                    );
                }
              });

            this.setState(st);
          }}
        />
        {this.sourceOptionList[this.state.selectedVersion].slice(1).map((option) => (
          <Option
            key={option.title}
            option={option}
            currentStyle={this.state.chosenOptions.BasedOnStyle}
            selected={this.state.chosenOptions[option.title]}
            onChange={({ title, titleNested, newValue } = {}) => {
              let st = this.state;
              if (newValue != "") {
                if (titleNested === undefined)
                  st.chosenOptions[title] = newValue;
                else st.chosenOptions[title][titleNested] = newValue;
              } else
                delete (newValue === undefined
                  ? st.chosenOptions[title]
                  : st.chosenOptions[title][titleNested]);
              this.setState(st);
            }}
          />
        ))}
      </div>
    );
  }
}

export default OptionList;

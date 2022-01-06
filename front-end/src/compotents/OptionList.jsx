import React from "react";
import sourceOptionList from "./options.json";
import OptionRegular from "./OptionRegular";
import OptionNested from "./OptionNested";

class OptionList extends React.Component {
    state = {
        selectedVersion: "",
        chosenOptions: { BasedOnStyle: "" },
    };

    constructor(props) {
        super(props);
        this.sortedVersions = Object.keys(sourceOptionList).sort(
            (a, b) => parseInt(b.split("-")[2]) - parseInt(a.split("-")[2])
        );
        this.state.selectedVersion = this.sortedVersions[0];
    }

    render() {
        return (
            <div className="OptionList">
                <OptionRegular
                    optionTitle="Version"
                    optionInfo="LLVM version"
                    optionList={this.sortedVersions}
                    onOptChange={(event) => {
                        console.log(this.state);
                        this.setState({ chosenOptions: {} });
                        this.setState({
                            selectedVersion: event.target.value,
                        });
                        console.log(this.state);
                    }}
                />
                <hr />
                {sourceOptionList[this.state.selectedVersion].map((x, y) =>
                    x["nestedOpts"].length === 0 ? (
                        <OptionRegular
                            key={x["name"]}
                            selectedValue={this.state.chosenOptions[x["name"]]}
                            optionTitle={x["name"]}
                            optionInfo={x["docString"]}
                            optionList={x["typeVariants"]}
                            onOptChange={(e) => {
                                let st = this.state;
                                if (e.target.value !== "Default")
                                    st.chosenOptions[x["name"]] =
                                        e.target.value;
                                else delete st.chosenOptions[x["name"]];
                                this.setState(st);
                            }}
                        />
                    ) : (
                        <OptionNested
                            key={x["name"]}
                            optionTitle={x["name"]}
                            optionInfo={x["docString"]}
                            optionList={x["nestedOpts"]}
                        />
                    )
                )}
            </div>
        );
    }
}

export default OptionList;

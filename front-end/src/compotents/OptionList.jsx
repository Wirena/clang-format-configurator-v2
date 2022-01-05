import React from "react";
import sourceOptionList from "./options.json";
import Option from "./Option";

class OptionList extends React.Component {
    state = {
        selectedVersion: "",
        selectedStyle: "",
    };

    constructor(props) {
        super(props);
        this.sortedVersions = Object.keys(sourceOptionList).sort(
            (a, b) => parseInt(b.split("-")[2]) - parseInt(a.split("-")[2])
        );
        this.state.selectedVersion = this.sortedVersions[0];
    }

    render() {
        console.log(this.state)
        return (
            <div className="OptionList">
                <Option
                    optionTitle="Version"
                    optionInfo="LLVM version"
                    optionList={this.sortedVersions}
                    onOptChange={(event) =>
                        this.setState({
                            selectedVersion: event.target.value,
                        })
                    }
                />
                <hr />
                {sourceOptionList[this.state.selectedVersion].map((x, y) => (
                    <Option
                        key={x["name"]}
                        optionTitle={x["name"]}
                        optionInfo={x["docString"]}
                        optionList={x["typeVariants"]}
                        onOptChange={(e) => {
                            let st = this.state;
                            st[x["name"]] = e.target.value;
                            this.setState(st);
                        }}
                        //onOptChange={y==0?(e)=>console.log("we"):console.log("aa")}
                    />
                ))}

                <Option
                    optionTitle={"T2153"}
                    optionInfo={"hellloo weewew"}
                    optionList={[1, 2, 3, 43]}
                />
            </div>
        );
    }
}

export default OptionList;

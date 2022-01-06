import React from "react";

const OptionNested = ({
    optionTitle,
    optionInfo,
    defaultOptions,
    optionList,
    onOptChange,
}) => {
    const [showInfo, setShowInfo] = React.useState(false);
    return (
        <div className="Option OptionNested">
            <div className="TopRow">
                <span>
                    <button
                        className="InfoButton"
                        onClick={() => setShowInfo(!showInfo)}
                        alt="ShowInfo"
                    >
                        <img alt="show info" src="/questionIcon.svg" />
                    </button>
                    <h4>{optionTitle}</h4>
                </span>
                <span className="NestedContainer">
                    {optionList.map((x) => {
                        return (
                            <div key={x["name"]}>
                                <span>
                                    <h4>{x["name"]}</h4>
                                </span>
                                {x["typeVariant"].length === 0 ? (
                                    
                                    <input className="OptionInput"></input>
                                ) : (
                                    <select
                                        className="OptionInput"
                                        onChange={onOptChange}
                                    >
                                        {["None", ...x["typeVariant"]].map(
                                            (x,index) => (
                                                <option key={x+index}>{x}</option>
                                            )
                                        )}
                                    </select>
                                )}
                            </div>
                        );
                    })}
                </span>
            </div>
            <div
                className="BottomRow"
                style={{
                    display: showInfo ? "block" : "none",
                }}
            >
                <div className="InfoField">
                    <h5 dangerouslySetInnerHTML={{ __html: optionInfo }}></h5>
                </div>
            </div>
        </div>
    );
};

export default OptionNested;

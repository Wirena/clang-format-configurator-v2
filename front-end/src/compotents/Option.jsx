import React from "react";

const Option = ({ optionTitle, optionInfo, defaultOption, optionList, onOptChange }) => {
    const [showInfo, setShowInfo] = React.useState(false);
    return (
        <div className="Option">
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
                <span>
                    {optionList.length == 0 ? <input className="OptionInput">
                    </input> : (
                        <select className="OptionInput" onChange={onOptChange}>
                            {optionList.map((x) => (
                                <option key={x}>{x}</option>
                            ))}
                        </select>
                    )}
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

export default Option;

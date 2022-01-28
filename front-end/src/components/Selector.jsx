import React from "react";
import "./Selector.module.css";
const Selector = ({
    selectionInfo,
    onChange,
    currentStyle,
    selectedValue,
    ...props
}) => {
    let input = {};
    switch (selectionInfo.argument_type) {
        case "unsigned":
        case "int":
            input = (
                <input
                    type="number"

                    placeholder={selectionInfo.defaults[currentStyle]}
                    onChange={onChange}
                    value={selectedValue.toString()}
                />
            );
            break;
        case "bool":
            input = (
                <select
                    onChange={onChange}
                    value={selectedValue}
                >
                    <option key={0}></option>
                    <option key={1}>true</option>
                    <option key={2}>false</option>
                </select>
            );
            break;
        case "std::string":
            input = (
                <input
                    type="text"
                    styleName={"selector selectorText"}
                    placeholder={selectionInfo.defaults}
                    value={selectedValue}
                />
            );

        default:
            input = (
                <select
                    value={selectedValue}
                    styleName={'selector selector_dropdown'}
                    onChange={onChange}
                >
                    {selectionInfo.arg_val_enum.map((value) => (
                        <option key={value}>{value}</option>
                    ))}
                </select>
            );
    }
    return <div>{input}</div>;
};

export default Selector;

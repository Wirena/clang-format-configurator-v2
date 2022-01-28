import React from "react";
import Collapsible from "react-collapsible";
import styles from "./Option.module.css";
import Selector from "./Selector";
const Option = ({ option, currentStyle, selected, onChange, ...props }) => {
    const [showDocString, setShowDocString] = React.useState(false);
    return (
        <section className={styles.option}>
            <span className={styles.title_container}>
                <button
                    className={styles.info_button}
                    alt="Show docstring"
                    onClick={() => setShowDocString(!showDocString)}
                >
                    <img
                        className={styles.info_button}
                        alt="show info"
                        src="/questionIcon.svg"
                    />
                </button>
                <span className={styles.title}>{option.title}</span>
                <Collapsible open={showDocString} transitionTime={100}>
                    <div
                        className={styles.docstring}
                        dangerouslySetInnerHTML={{
                            __html: option.docstring,
                        }}
                    ></div>
                </Collapsible>
            </span>

            {option.values.map((value) => {
                const getSelectedValue = () => {
                    if (selected === undefined) return "";
                    if (option.values.length==1) return selected;
                    return selected[value.title] || "";
                };

                return (
                    <Selector
                        key={value.title}
                        selectionInfo={value}
                        selectedValue={getSelectedValue()}
                        onChange={(event) =>
                            onChange({
                                title: option.title,
                                titleNested:
                                    option.values.length === 1
                                        ? undefined
                                        : option.values[0].title,
                                newValue: event.target.value,
                            })
                        }
                        currentStyle={currentStyle}
                    />
                );
            })}
        </section>
    );
};

export default Option;

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

      {option.values.length === 1 ? (
        <Selector
          key={option.values[0].title}
          selectionInfo={option.values[0]}
          selectedValue={selected || ""}
          onChange={(event) => {
            let newVal = event.target.value;
            if (newVal.toString() === "") newVal = undefined;
            onChange({
              title: option.title,
              newValue: newVal,
            });
          }}
          currentStyle={currentStyle}
        />
      ) : (
        <span className={styles.nested_container}>
          {option.values.map((value) => {
            return (
              <div key={value.title}>
                <span className={styles.title_nested}>{value.title}</span>
                <Selector
                  selectionInfo={value}
                  selectedValue={
                    selected === undefined ? "" : selected[value.title]
                  }
                  onChange={(event) => {
                    let newVal = event.target.value;
                    if (newVal.toString() === "") newVal = undefined;
                    //console.log(value.title + newVal)
                    onChange({
                      title: option.title,
                      titleNested: value.title,
                      newValue: newVal,
                    });
                  }}
                  currentStyle={currentStyle}
                />
              </div>
            );
          })}
        </span>
      )}
    </section>
  );
};

export default Option;

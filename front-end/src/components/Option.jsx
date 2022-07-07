import React from "react";
import Collapsible from "react-collapsible";
import styles from "./Option.module.css";
import SingleSelector from "./SingleSelector";
import MapSelector from "./MapSelector";
import ArraySelector from "./ArraySelector";


const Option = ({ optionInfo,
  currentOptionValue,
  currentStyle,
  onChange
}) => {
  const [showDocString, setShowDocString] = React.useState(false);

  const placeSelector = () => {
    const onChangeFunc = (newOptionValue) => { onChange(optionInfo.title, newOptionValue) }
    switch (optionInfo.title) {
      case "BraceWrapping":
      case "SpacesInLineCommentPrefix":
        return (<MapSelector
          selectorInfo={optionInfo.values}
          currentOptionValue={currentOptionValue}
          currentStyle={currentStyle}
          onChange={onChangeFunc}
        />)
      default:
        if (optionInfo.values[0].argument_type.includes("std::vector<")) {
          return (<ArraySelector
            selectorInfo={optionInfo.values[0]}
            currentStyle={currentStyle}
            currentOptionValue={currentOptionValue}
            onChange={onChangeFunc}
          />)
        } else {
          return (<SingleSelector
            key={optionInfo.title}
            selectorInfo={optionInfo.values[0]}
            defaultValue={optionInfo.values[0].defaults[currentStyle]}
            currentOptionValue={currentOptionValue}
            onChange={onChangeFunc}
          />)
        }
    }
  }


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
            src="./questionIcon.svg"
          />
        </button>
        <span className={styles.title}>{optionInfo.title}</span>
        <Collapsible open={showDocString} transitionTime={100}>
          <div
            className={styles.docstring}
            dangerouslySetInnerHTML={{
              __html: optionInfo.docstring,
            }}
          ></div>
        </Collapsible>
      </span>
      {placeSelector()}
    </section>
  );
}


export default Option;

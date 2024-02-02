import React from "react";
import Collapsible from "react-collapsible";
import styles from "./Option.module.css";
import SingleSelector from "./SingleSelector";
import MapSelector from "./MapSelector";
import ArraySelector from "./ArraySelector";
import { over } from "lodash";


const Option = ({ optionInfo,
  currentOptionValue,
  currentStyle,
  onChange,
  overridenBy
}) => {
  const [showDocString, setShowDocString] = React.useState(false);

  const placeSelector = () => {
    const onChangeFunc = (newOptionValue) => { onChange(optionInfo.title, newOptionValue) }
    switch (optionInfo.title) {

      case "AlignTrailingComments":
        if (optionInfo.values.length === 1)
          return (<SingleSelector
            key={optionInfo.title}
            selectorInfo={optionInfo.values[0]}
            defaultValue={optionInfo.values[0].defaults[currentStyle]}
            currentOptionValue={currentOptionValue}
            onChange={onChangeFunc}
          />)
      // else fallthrough
      case "BraceWrapping":
      case "SpaceBeforeParensOptions":
      case "SpacesInLineCommentPrefix":
        return (<MapSelector
          selectorInfo={optionInfo.values}
          currentOptionValue={currentOptionValue}
          currentStyle={currentStyle}
          onChange={onChangeFunc}
        />)
      default:
        if (optionInfo.values[0].argument_type.includes("std::vector<"))
          return (<ArraySelector
            selectorInfo={optionInfo.values[0]}
            currentStyle={currentStyle}
            currentOptionValue={currentOptionValue}
            onChange={onChangeFunc}
          />)

        if (optionInfo.values.length > 2)
          return (<MapSelector
            selectorInfo={optionInfo.values}
            currentOptionValue={currentOptionValue}
            currentStyle={currentStyle}
            onChange={onChangeFunc}
          />)

        return (<SingleSelector
          key={optionInfo.title}
          selectorInfo={optionInfo.values[0]}
          defaultValue={optionInfo.values[0].defaults[currentStyle]}
          currentOptionValue={currentOptionValue}
          onChange={onChangeFunc}
        />)

    }
  }

  const overrideWarningText = overridenBy === undefined ? "" : " overriden by " + overridenBy

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
        <span className={optionInfo.deprecated ? styles.title_deprecated : styles.title}>{optionInfo.title}</span>
        <span className={styles.overriden_waring}>{overrideWarningText}</span>
        <Collapsible open={showDocString} transitionTime={100}>
          <div
            hidden={showDocString ? "" : "hidden"}
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

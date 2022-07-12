import yaml from "yaml"
import { cloneDeepWith, cloneDeep, isEmpty, isEqual, isNumber, isObject } from "lodash";


function removeOptionsDuplicatingStyleDefs(options, modifiedOptionTitles, unmodifiedOptions) {
  for (const [key1, value1] of Object.entries(options)) {

    if (key1 === "BasedOnStyle") continue

    if (!modifiedOptionTitles.includes(key1)) {
      delete options[key1]
      continue
    }

    if (Array.isArray(value1)) {
      if (isEqual(value1, unmodifiedOptions[key1]))
        delete options[key1]
      continue
    }

    // if object, compare its properties and delete those that match unmodified defaults
    if (isObject(value1)) {
      for (const [key2, value2] of Object.entries(value1))
        if (value2 === unmodifiedOptions[key1][key2])
          delete options[key1][key2]
      if (Object.entries(options[key1]).length === 0)
        delete options[key1]
      continue
    }

    if (value1 === unmodifiedOptions[key1])
      delete options[key1]
  }
  return options
}

export function buildYamlConfigFile(chosenOptions, modifiedOptionTitles, unmodifiedOptions) {
  let options = cloneDeep(chosenOptions)
  if (options.BasedOnStyle !== undefined)
    options = removeOptionsDuplicatingStyleDefs(options, modifiedOptionTitles, unmodifiedOptions)
  delete options.selectedVersion
  const doc = new yaml.Document();
  doc.contents = options
  const YamlOptions = {
    directives: true
  }
  return doc.toString(YamlOptions)
}



function removeEmpty(obj) {
  Object.entries(obj).filter(([k, v]) => isObject(v)).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      //remove empty objects from array
      obj[k] = v.filter(n => Object.entries(Object.fromEntries(
        Object.entries(n).filter(([_, v]) => v != null))).length)
      if (obj[k].length === 0)
        delete obj[k]
    } else if (isEmpty(v)) obj[k] = undefined; else v = removeEmpty(v)
  })
  return obj
}


export function buildYamlCmdString(chosenOptions, config) {
  //clone object not to interfere with App's state
  const customizer = (value, key, object) => {
    if (object) {
      /*
          This part is kinda cringe: clang-format cant parse flow style yaml file
          when integer value is not followed by comma, i.e. any last integer value will give an error,
          Example:
          {
            Regex: '^<ext/.*\.h>',
            Priority: 2,
            SortPriority: 0,          <--- OK
            CaseSensitive: 'false'
          },
          {
            Regex: '^<.*\.h>',
            Priority: '1',
            SortPriority: 0           <---- Apparently not OK
          },


          So we turn all number into strings. Genius
      */
      if (isNumber(value))
        return value.toString();

      // And also remove empty objects. Clang-format does not like them either
      if (isEmpty(value) && isObject(value))
        return null
    }
    return undefined;
  }

  const doc = new yaml.Document();
  doc.contents = removeEmpty(cloneDeepWith(chosenOptions, customizer))
  delete doc.contents.selectedVersion
  const YamlOptions = {
    collectionStyle: 'flow', indentSeq: false,
    // false, true and other values have to be strings for the same reason as numbers
    falseStr: "'false'", trueStr: "'true'", defaultStringType: 'QUOTE_SINGLE',
    defaultKeyType: 'PLAIN',
  }
  return doc.toString(YamlOptions)
}




export function loadOptionsFromFile(fileName, config, selectedVersion, onLoaded) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const options = yaml.parse(e.target.result)
    const BasedOnStyle = options.BasedOnStyle

    if (BasedOnStyle === undefined) {
      const modifiedOptionTitles = Object.entries(options).map(([k, v]) => { return k })
      console.log(modifiedOptionTitles)
      options.selectedVersion = selectedVersion
      onLoaded({
        newOptions: options, _unmodifiedOptions: undefined,
        _modifiedOptionTitles: modifiedOptionTitles
      })
      return
    }

    // check if config is compatible with selected version
    // values might also differ for same key from version to version but this solution is ok for now
    const listOfOptionTitles = config[selectedVersion].map(el => el.title)
    Object.entries(options).forEach(([k, v]) => {
      if (!listOfOptionTitles.includes(k)) { throw new Error("Config contains keys that are incompatible with selected clang-format version") }
    })


    // fill optionsWithDefaults with default values for selected style
    let unmodifiedOptions = {
      selectedVersion: selectedVersion,
      BasedOnStyle: BasedOnStyle
    }

    config[unmodifiedOptions.selectedVersion]
      .slice(1).forEach((option) => {
        if (
          option.values.length === 1 &&
          option.values[0].defaults[BasedOnStyle] !== undefined
        ) {
          unmodifiedOptions[option.title] =
            option.values[0].defaults[BasedOnStyle].value;
        } else {
          // set all option values to selected style defaults
          // inluding nested ones
          // filter out options without defaults for this style
          option.values.filter((element) => element.defaults[BasedOnStyle] !== undefined)
            .forEach((nestedOption) => {
              if (unmodifiedOptions[option.title] == undefined)
                unmodifiedOptions[option.title] = {}
              unmodifiedOptions[option.title][nestedOption.title] =
                nestedOption.defaults[BasedOnStyle].value
            }
            );
        }
      });
    let modifedOptions = cloneDeep(unmodifiedOptions)
    let modifiedOptionTitles = []
    Object.entries(options).forEach(([k, v]) => { modifedOptions[k] = v; modifiedOptionTitles.push(k) })
    console.log(modifedOptions)
    onLoaded({
      newOptions: modifedOptions, _unmodifiedOptions: unmodifiedOptions,
      _modifiedOptionTitles: modifiedOptionTitles
    })
  }
  reader.readAsText(fileName)
}
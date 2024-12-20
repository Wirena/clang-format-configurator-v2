import yaml from "yaml"
import { cloneDeepWith, cloneDeep, isEmpty, isEqual, isNumber, isObject } from "lodash";

export class ValidationError extends Error { }


function mapAlignConsecutive(value, version) {
  switch (value) {
    case "None":
      if (version >= 18)
        return {
          Enabled: false,
          AcrossEmptyLines: false,
          AcrossComments: false,
          AlignCompound: false,
          AlignFunctionPointers: false,
          PadOperators: true
        }
      else
        return {
          Enabled: false,
          AcrossEmptyLines: false,
          AcrossComments: false,
          AlignCompound: false,
          PadOperators: true
        }
    case "Consecutive":
      if (version >= 18)
        return {
          Enabled: true,
          AcrossEmptyLines: false,
          AcrossComments: false,
          AlignCompound: false,
          AlignFunctionPointers: false,
          PadOperators: true
        }
      else
        return {
          Enabled: true,
          AcrossEmptyLines: false,
          AcrossComments: false,
          AlignCompound: false,
          PadOperators: true
        }
    case "AcrossEmptyLines":
      if (version >= 18)
        return {
          Enabled: true,
          AcrossEmptyLines: true,
          AcrossComments: false,
          AlignCompound: false,
          AlignFunctionPointers: false,
          PadOperators: true
        }
      else
        return {
          Enabled: true,
          AcrossEmptyLines: true,
          AcrossComments: false,
          AlignCompound: false,
          PadOperators: true
        }
    case "AcrossComments":
      if (version >= 18)
        return {
          Enabled: true,
          AcrossEmptyLines: false,
          AcrossComments: true,
          AlignCompound: false,
          AlignFunctionPointers: false,
          PadOperators: true
        }
      else return {
        Enabled: true,
        AcrossEmptyLines: false,
        AcrossComments: true,
        AlignCompound: false,
        PadOperators: true
      }
    case "AcrossEmptyLinesAndComments":
      if (version >= 18)
        return {
          Enabled: true,
          AcrossEmptyLines: true,
          AcrossComments: true,
          AlignCompound: false,
          AlignFunctionPointers: false,
          PadOperators: true
        }
      else
        return {
          Enabled: true,
          AcrossEmptyLines: true,
          AcrossComments: true,
          AlignCompound: false,
          PadOperators: true
        }
    case "true":
      if (version >= 18)
        return {
          Enabled: true,
          AcrossEmptyLines: false,
          AcrossComments: false,
          AlignCompound: false,
          AlignFunctionPointers: false,
          PadOperators: true
        }
      else
        return {
          Enabled: true,
          AcrossEmptyLines: false,
          AcrossComments: false,
          AlignCompound: false,
          PadOperators: true
        }
    case "false":
      if (version >= 18)
        return {
          Enabled: false,
          AcrossEmptyLines: false,
          AcrossComments: false,
          AlignCompound: false,
          AlignFunctionPointers: false,
          PadOperators: true
        }
      else
        return {
          Enabled: false,
          AcrossEmptyLines: false,
          AcrossComments: false,
          AlignCompound: false,
          PadOperators: true
        }
    default:
      return undefined
  }
}



export function convertLegacyAlignConsectutiveOptions(yamlString, version) {
  let options = yaml.parse(yamlString)
  const optionsList = Object.keys(options)
  for (let i = 0; i < optionsList.length; i++) {
    const isString = typeof options[optionsList[i]] === "string";
    const isBoolean = typeof options[optionsList[i]] === "boolean";
    if (optionsList[i].startsWith("AlignConsecutive") && (isBoolean || isString)) {
      const currentVal = options[optionsList[i]];
      options[optionsList[i]] = mapAlignConsecutive(isString ? currentVal : currentVal.toString(), version)
    }
  }
  const doc = new yaml.Document();
  doc.contents = options
  const YamlOptions = {
    directives: true
  }
  return doc.toString(YamlOptions)
}

function removeOptionsDuplicatingStyleDefs(options, modifiedOptionTitles, unmodifiedOptions) {
  for (const [key1, value1] of Object.entries(options)) {

    if (key1 === "BasedOnStyle") continue

    if (key1 === "BraceWrapping") {
      if (options["BreakBeforeBraces"] !== "Custom") {
        delete options[key1]
      }
      continue
    }

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



export function buildYamlConfigFile(chosenOptions, removeDuplicates, modifiedOptionTitles, unmodifiedOptions) {
  let options = cloneDeep(chosenOptions)
  if (options.BasedOnStyle !== undefined && removeDuplicates)
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


export function loadOptionsFromString(optionsStr, config, selectedVersion, onLoaded) {
  const options = yaml.parse(optionsStr)
  if (typeof (options) == "string" || Array.isArray(options) || options === null)
    throw new Error("Looks like invalid yaml file")

  manuallyValidate(options, selectedVersion)

  const BasedOnStyle = options.BasedOnStyle
  if (BasedOnStyle === undefined) {
    const modifiedOptionTitles = Object.entries(options).map(([k, v]) => { return k })
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
    if (!listOfOptionTitles.includes(k)) {
      throw new Error("Config contains key that is incompatible with selected clang-format version:\n" + k)
    }
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
  Object.entries(options).forEach(([k, v]) => {
    if (isObject(modifedOptions[k]))
      /*if value is object such as BraceWrapping i.e. has nested options
       then simply doing modifedOptions[k] = v; will undefine those properties
      which were not declared in user selected .clang-format file
      */
      Object.assign(modifedOptions[k], v)
    else
      modifedOptions[k] = v;
    modifiedOptionTitles.push(k)
  })
  onLoaded({
    newOptions: modifedOptions, _unmodifiedOptions: unmodifiedOptions,
    _modifiedOptionTitles: modifiedOptionTitles
  })

}



export function loadOptionsFromFile(fileName, config, selectedVersion, onError, onLoaded) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const options = yaml.parse(e.target.result)
      if (typeof (options) == "string")
        throw new Error("Looks like invalid yaml file")
      const BasedOnStyle = options.BasedOnStyle

      if (BasedOnStyle === undefined) {
        const modifiedOptionTitles = Object.entries(options).map(([k, v]) => { return k })
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
        if (!listOfOptionTitles.includes(k)) {
          throw new Error("Config contains key that is incompatible with selected clang-format version:\n" + k)
        }
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
      Object.entries(options).forEach(([k, v]) => {
        if (isObject(modifedOptions[k]))
          /*if value is object such as BraceWrapping i.e. has nested options
           then simply doing modifedOptions[k] = v; will undefine those properties
          which were not declared in user selected .clang-format file
          */
          Object.assign(modifedOptions[k], v)
        else
          modifedOptions[k] = v;
        modifiedOptionTitles.push(k)
      })
      onLoaded({
        newOptions: modifedOptions, _unmodifiedOptions: unmodifiedOptions,
        _modifiedOptionTitles: modifiedOptionTitles
      })
    } catch (e) {
      onError(e.message)
    }
  }
  reader.readAsText(fileName)
}



export function manuallyValidate(config, version) {
  // Check AlignConsecutive legacy values
  if (parseInt(version) >= 15) {
    const optionsList = Object.keys(config)
    for (let i = 0; i < optionsList.length; i++) {
      const isString = typeof config[optionsList[i]] === "string";
      const isBoolean = typeof config[optionsList[i]] === "boolean";
      if (optionsList[i].startsWith("AlignConsecutive") && (isBoolean || isString)) {
        throw new ValidationError()
      }
    }
  }
}


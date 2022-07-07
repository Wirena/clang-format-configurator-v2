import yaml from "yaml"
import { cloneDeepWith, isEmpty, isNumber, isObject } from "lodash";



export function buildYamlConfigFile() {

}


function removeOptionsDuplicatingStyleDefs(chosenOptions, config) {
  const selVerConf = config[chosenOptions.selectedVersion]
  delete chosenOptions.selectedVersion
  for (const element in selVerConf) {
    if (chosenOptions[element.title] === undefined)
      continue
  }
}


function removeEmpty(obj) {
  Object.entries(obj).filter(([k, v]) => isObject(v)).forEach(([k, v]) => {
    if (Array.isArray(v)) {
      //remove empty objects from array
      obj[k] = v.filter(n => Object.entries(Object.fromEntries(
        Object.entries(n).filter(([_, v]) => v != null))).length)
      if (obj[k].length == 0)
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
    // false, true and other values has to be strings for the same reason as numbers
    falseStr: "'false'", trueStr: "'true'", defaultStringType: 'QUOTE_SINGLE',
    defaultKeyType: 'PLAIN',
  }
  return doc.toString(YamlOptions)
}
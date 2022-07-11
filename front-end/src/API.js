import config from "./config.json";

export function Format(code, yamlStyle, version, language, onFormat, onError) {
  let filext = "";
  switch (language) {
    case "c_cpp":
      filext = ".cpp"
      break;
    case "java":
      filext = ".java"
      break
  }
  const body = { code: code, style: yamlStyle }
  fetch(config.FormatApiUrl + new URLSearchParams({
    version: version.split('-')[2],
    filext: filext
  }), {
    body: JSON.stringify(body),
    mode: 'cors',
    method: 'POST'
  })
    .then(response => {
      if (response.ok)
        response.text().then(onFormat)
      else
        response.text().then(onError)
    }).catch((errorObject) => {onError(errorObject.toString())})
}
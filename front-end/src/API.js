export function Format(code, yamlStyle, version, language, onFormat, onError) {
  let filext = "";
  switch (language) {
    case "c_cpp":
      filext = "cpp"
      break;
  }

  const body = { code: code, style: yamlStyle }
  fetch('http://localhost:8080/format?' + new URLSearchParams({
    version: version.split('-')[2],
    filext: "cpp"
  }), {
    body: JSON.stringify(body),
    mode: 'cors',
    method: 'POST'
  })
    .then(response => {
      if (response.ok) response.text().then(onFormat)
      else response.text().then(onError)
    }).catch(onError)
}
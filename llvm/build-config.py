#!/bin/python3
from email.policy import default
import re
import sys
import os
import json
import functools
import yaml
from yaml.resolver import Resolver

# TODO: rewrite this shit using rst2html or something
# TODO: 2 years later: I no longer understand how this code works

known_types = ["bool", "unsigned", "std::string", "std::vector<std::string>", "int",
               "std::vector<IncludeCategory>", "std::vector<RawStringFormat>"]

new_type_naming_map = {"Boolean": "bool", "Unsigned": "unsigned", "String": "std::string",
                       "Integer": "int", "List of Strings": "std::vector<std::string>",
                       "List of RawStringFormats": "std::vector<RawStringFormat>",
                       "List of IncludeCategories": "std::vector<IncludeCategory>"}


def parse_nested_conf_flags(text: str):
    # group 1 - type, group 2 - name
    matches = re.finditer(r'^  \* ``(.*?) (.*?)``', text, re.MULTILINE)
    nopts = []

    for m in matches:
        variants = []
        typename = m.group(1)
        if typename in new_type_naming_map:
            typename = new_type_naming_map[typename]
        if typename not in known_types:
            variants.insert(0, "")
            matches1 = re.finditer(
                r'^    \* ``.*`` \(in configuration: ``(.*)``', text, re.MULTILINE)

            for m1 in matches1:
                variants.append(m1.group(1))

        nopts.append(
            {"title": m.group(2), "argument_type": typename, "arg_val_enum": variants})
    return nopts


def parse_unknown_arg_type(text: str):
    # group 1 - type variant
    matches = re.finditer(r'\* ``.*`` \(in configuration: ``(.*)``\)', text)
    typeVariants = list(map(lambda m: m.group(1), matches))
    typeVariants.insert(0, "")
    return typeVariants


def parse_based_on_style(header: str, body: str):
    # group 1 - option name, group 2 - type
    header_match = re.match(r'\*{2}(\w+)\*{2} \(``(.*)``\)',
                            header)

    variants_matches = re.finditer(r'\* ``(.*)', body)
    typeVariants = list(map(lambda m: m.group(1).replace("``", ""),
                            variants_matches))
    typeVariants.insert(0, '')
    return {"title": header_match.group(1), "docstring":
            rst_docstring_to_html_codeblock(body).replace("`_", ""),
            "values": [{"title": header_match.group(1), "argument_type": header_match.group(2),
                       "arg_val_enum": typeVariants}]}


def rst_docstring_to_html_codeblock(docstring: str) -> str:
    def repl(match):
        if match.group(4) is not None:
            return '<pre>'+match.group(4).replace('<', "&lt;").replace('>', "&gt;")+'</pre>'
        elif match.group(6) is not None:
            return '<p>' + match.group(6) + '</p>'

    # multiline code and paragraphs
    #  group 3 - language, group 4 - code, group 6 - paragraph
    docstring = docstring.strip()
    docstring = re.sub(r'(?P<indent>  +)(\.\. code-block:: (.*?)\s+$)((\n|(?P=indent)  .*)+)|(^.+?\n)',
                  repl, docstring, 0, re.MULTILINE)
    # single line code
    docstring = re.sub(r'`{1,2}(.+?)`{1,2}',
                  r'<code>\g<1></code>', docstring, 0, re.MULTILINE)
    ## replate **deprecated** with
    docstring = docstring.replace("**deprecated**", "<b>DEPRECATED</b>")
    return docstring.strip()

def check_if_deprecated_by_docstring(docstring: str) -> bool:
    return "**deprecated**" in docstring

def parse_rst(rst: str):

    end_substr = ".. END_FORMAT_STYLE_OPTIONS"
    end_index = rst.find(end_substr)
    options = re.split(r'(^\*{2}\w+\*{2} \(``.*``\))',
                       rst[0:end_index], 0, re.MULTILINE)

    del (options[0])

    options_list = [parse_based_on_style(options[0], options[1])]

    for i in range(2, len(options), 2):
        # group 1 - option name, group 2 - type
        opt_header_match = re.match(
            r'\*{2}(\w+)\*{2} \(``(.*)``\)', options[i])
        if opt_header_match is None:
            sys.stderr.write(f'Error parsing option header:{options[i]}')
            continue


        i += 1
        cur_opt = {"title": opt_header_match.group(
            1), "docstring": rst_docstring_to_html_codeblock(options[i])
            # yep, bringing closer the global warming and the heat death of the universe by calling a replace method
            # on a version 7-13  docstring that is guaranteed not to have a singe occurrence of ":versionbadge:"
            .replace(":versionbadge:", "Introduced in:"),
            "deprecated": check_if_deprecated_by_docstring(options[i]),
            "values": []}
        values = []

        if "Nested configuration flags:" in options[i]:
            nestedOpts = parse_nested_conf_flags(options[i])
            if nestedOpts is None:
                sys.stderr.write(f'Error parsing nested options:{options[i]}')
            else:
                values = nestedOpts
        else:
            arg_enum = []
            typename = opt_header_match.group(2)
            if typename in new_type_naming_map:
                typename = new_type_naming_map[typename]

            if typename not in known_types:
                arg_enum = parse_unknown_arg_type(options[i])
                if arg_enum is None:
                    sys.stderr.write(
                        f'Error parsing type variants:{options[i]}')
                    arg_enum = []
            values.append(
                {"title": cur_opt["title"], "argument_type": typename, "arg_val_enum": arg_enum})

        cur_opt["values"] = values
        options_list.append(cur_opt)

    return options_list


def parse_defaults(path: str, optionList, version: str):
    configs = next(os.walk(path), (None, None, []))[2]
    configs = list(
        filter(lambda filename: filename.find(version) != -1, configs))
    styles = {}
    for styleFileName in configs:
        try:
            f = open(f"{path}/{styleFileName}", "r")
            styles[styleFileName.split("_")[1]] = yaml.safe_load(f.read())
            f.close()
        except FileNotFoundError:
            sys.stderr.write(
                f"Failed to open file {path}/{styleFileName}, continuing")

    for optionIndex in range(len(optionList)):
        if len(optionList[optionIndex]["values"]) == 1:
            defaults = {}
            for styleName, defaultsList in styles.items():
                if optionList[optionIndex]["title"] not in defaultsList or optionList[optionIndex]["title"] == "Language":
                    continue
                defaults[styleName] = {
                    "value": defaultsList[optionList[optionIndex]["title"]]}
            optionList[optionIndex]["values"][0]["defaults"] = defaults
        else:
            values = optionList[optionIndex]["values"]
            for valuesIndex in range(len(values)):
                defaults = {}
                for styleName, defaultsList in styles.items():
                    if optionList[optionIndex]["title"] not in defaultsList or \
                            values[valuesIndex]["title"] not in defaultsList[optionList[optionIndex]["title"]] \
                            or optionList[optionIndex]["title"] == "Language":
                        continue
                    defaults[styleName] = {
                        "value": defaultsList[optionList[optionIndex]["title"]][values[valuesIndex]["title"]]}
                values[valuesIndex]["defaults"] = defaults


def docFileNameVersionComparator(a: str, b: str):
    a_splitted = a.split('.')
    b_splitted = b.split('.')
    a_ver = a_splitted[0] * 1000 + a_splitted[1] * 10 + a_splitted[2]
    b_ver = b_splitted[0] * 1000 + b_splitted[1] * 10 + b_splitted[2]
    return int(b_ver) - int(a_ver)


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("3 args expected: path to dir with rst docs, path to dir with defaults, output file path")
        exit()
    files = sorted(next(os.walk(sys.argv[1]), (None, None, []))[2],
                   key=functools.cmp_to_key(docFileNameVersionComparator))
    optionList = {"FormatApiUrl": "http://localhost:8080/format?",
                  "Versions":
                  {"title": "Version", "docstring": "LLVM Version",
                   "deprecated": False,
                   "values": [{"arg_val_enum": [],
                              "title": "Version",
                               "argument_type": "",
                               "defaults": []}]}}
    for ch in "OoYyNn":
        if len(Resolver.yaml_implicit_resolvers[ch]) == 1:
            del Resolver.yaml_implicit_resolvers[ch]
        else:
            Resolver.yaml_implicit_resolvers[ch] = [
                x for x in Resolver.yaml_implicit_resolvers[ch] if x[0] != 'tag:yaml.org,2002:bool']
    for filename in files:
        version = filename.replace(".rst", "")
        current_version = version
        optionList["Versions"]["values"][0]["arg_val_enum"].append(
            current_version)
        f = open(f"{sys.argv[1]}/{filename}", "r")
        optionList[current_version] = parse_rst(f.read())
        parse_defaults(sys.argv[2], optionList[current_version], version)

    fo = open(sys.argv[3], "w")
    fo.write(json.dumps(optionList))
    fo.close()

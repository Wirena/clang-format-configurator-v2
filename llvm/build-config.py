#!/bin/python3
import re
import sys
import os
import json
import yaml
from yaml.resolver import Resolver

# TODO: rewrite this shit using rst2html or something

known_types = ["bool", "unsigned", "std::string", "std::vector<std::string>", "int",
               "std::vector<IncludeCategory>", "std::vector<RawStringFormat>"]


def parse_nested_conf_flags(text: str):
    # group 1 - type, group 2 - name
    matches = re.finditer(r'^  \* ``(.*?) (.*?)``', text, re.MULTILINE)
    nopts = []

    for m in matches:
        variants = []
        if m.group(1) not in known_types:
            variants.insert(0, "")
            matches1 = re.finditer(
                r'^    \* ``.*`` \(in configuration: ``(.*)``', text, re.MULTILINE)

            for m1 in matches1:
                variants.append(m1.group(1))

        nopts.append({"title": m.group(2), "argument_type": m.group(
            1), "arg_val_enum": variants})
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
    return {"title": header_match.group(1), "docstring": rst_docstring_to_html_codeblock(body).replace("`_", ""),
            "values": [{"title": header_match.group(1), "argument_type": header_match.group(2),
                       "arg_val_enum": typeVariants}]}


def rst_docstring_to_html_codeblock(text: str) -> str:
    def repl(match):
        if match.group(4) is not None:
            return '<pre>'+match.group(4).replace('<', "&lt;").replace('>', "&gt;")+'</pre>'
        elif match.group(6) is not None:
            return '<p>' + match.group(6) + '</p>'

    # multiline code and paragraphs
    #  group 3 - language, group 4 - code, group 6 - paragraph
    text = text.strip()
    text = re.sub(r'(?P<indent>  +)(\.\. code-block:: (.*?)\s+$)((\n|(?P=indent)  .*)+)|(^.+?\n)',
                  repl, text, 0, re.MULTILINE)
    # single line code
    text = re.sub(r'``(.+?)``', r'<code>\g<1></code>', text, 0, re.MULTILINE)
    return text.strip()


def parse_rst(rst: str):

    end_substr = ".. END_FORMAT_STYLE_OPTIONS"
    end_index = rst.find(end_substr)
    options = re.split(r'(^\*{2}\w+\*{2} \(``.*``\))',
                       rst[0:end_index], 0, re.MULTILINE)

    del(options[0])

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
            1), "docstring": rst_docstring_to_html_codeblock(options[i]), "values": []}
        values = []

        if "Nested configuration flags:" in options[i]:
            nestedOpts = parse_nested_conf_flags(options[i])
            if nestedOpts is None:
                sys.stderr.write(f'Error parsing nested options:{options[i]}')
            else:
                values = nestedOpts
        else:
            arg_enum = []
            if opt_header_match.group(2) not in known_types:
                arg_enum = parse_unknown_arg_type(options[i])
                if arg_enum is None:
                    sys.stderr.write(
                        f'Error parsing type variants:{options[i]}')
                    arg_enum = []
            values.append({"title": cur_opt["title"], "argument_type": opt_header_match.group(
                2), "arg_val_enum": arg_enum})

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
            sys.sterr.write(
                f"Failed to open file {path}/{styleFileName}, continuing")

    for optionIndex in range(len(optionList)):
        if len(optionList[optionIndex]["values"]) == 1:
            defaults = {}
            for styleName, defaultsList in styles.items():
                if optionList[optionIndex]["title"] not in defaultsList:
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
                            values[valuesIndex]["title"] not in defaultsList[optionList[optionIndex]["title"]]:
                        continue
                    defaults[styleName] = {
                        "value": defaultsList[optionList[optionIndex]["title"]][values[valuesIndex]["title"]]}
                values[valuesIndex]["defaults"] = defaults


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("3 args expected: path to dir with rst docs, path to dir with defaults, output file path")
    files = next(os.walk(sys.argv[1]), (None, None, []))[2]  # [] if no file
    optionList = {}
    for ch in "OoYyNn":
        if len(Resolver.yaml_implicit_resolvers[ch]) == 1:
            del Resolver.yaml_implicit_resolvers[ch]
        else:
            Resolver.yaml_implicit_resolvers[ch] = [
                x for x in Resolver.yaml_implicit_resolvers[ch] if x[0] != 'tag:yaml.org,2002:bool']

    for filename in files:
        version = filename.replace(".rst", "")
        current_version = "clang-format-" + version
        f = open(f"{sys.argv[1]}/{filename}", "r")
        optionList[current_version] = parse_rst(f.read())
        parse_defaults(sys.argv[2], optionList[current_version], version)

    fo = open(sys.argv[3], "w")
    fo.write(json.dumps(optionList))
    fo.close()

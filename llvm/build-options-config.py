#!/bin/python3
import re
import sys
import os
import json
import yaml

# TODO: rewrite this shit using rst2html or something

known_types = ["bool", "unsigned", "std::string", "std::vector<std::string>", "int",
               "std::vector<IncludeCategory>", "std::vector<RawStringFormat>"]


def parse_nested(text: str):
    # group 1 - type, group 2 - name
    matches = re.finditer(r'^  \* ``(.*?) (.*?)``', text, re.MULTILINE)
    nopts = []

    for m in matches:
        variants = ['Default']
        if m.group(1) not in known_types:
            matches1 = re.finditer(
                r'^    \* ``.*`` \(in configuration: ``(.*)``', text, re.MULTILINE)

            for m1 in matches1:
                variants.append(m1.group(1))
        else:
            if m.group(1) == 'bool':
                variants.append('true')
                variants.append('false')
        nopts.append({"name":m.group(2),"argType":m.group(1),"typeVariant":variants})
    return nopts


def parse_unknown_type_variants(text: str):
    # group 1 - type variant
    matches = re.finditer(r'\* ``.*`` \(in configuration: ``(.*)``\)', text)
    typeVariants = list(map(lambda m: m.group(1), matches))
    typeVariants.insert(0, "Default")
    return typeVariants


def parse_based_on_style(header: str, body: str):
    # group 1 - option name, group 2 - type
    header_match = re.match(r'\*{2}(\w+)\*{2} \(``(.*)``\)',
                            header)

    variants_matches = re.finditer(r'\* ``(.*)', body)
    typeVariants = list(map(lambda m: m.group(1).replace("``", ""),
                            variants_matches))
    typeVariants.insert(0, 'Default')
    return {"name": header_match.group(1), "argType": header_match.group(2),
            "docString": rst_to_html_docstring(body).replace("`_", ""),"nestedOpts":[], "typeVariants": typeVariants}


def rst_to_html_docstring(text: str) -> str:
    def repl(match):
        if match.group(4) is not None:
            return '<pre>'+match.group(4).replace('<', "&lt;").replace('>', "&gt;")+'</pre>'
        elif match.group(6) is not None:
            return '<p>' + match.group(6) + '</p>'

    # multiline code and paragraphs
    #  group 3 - language, group 4 - code, group 6 - paragraph
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
        cur_opt = {"name": opt_header_match.group(1), "argType": opt_header_match.group(
            2), "docString": rst_to_html_docstring(options[i]), "nestedOpts":[]}
        if opt_header_match.group(2) in known_types:
            if opt_header_match.group(2) == "bool":
                cur_opt["typeVariants"] = ["Default", "false", "true"]
            options_list.append(cur_opt)
            continue

        nestedOpts = []
        typeVariants = []

        if "Nested configuration flags:" in options[i]:
            nestedOpts = parse_nested(options[i])
            if nestedOpts is None:
                sys.stderr.write(f'Error parsing nested options:{options[i]}')
        else:
            typeVariants = parse_unknown_type_variants(options[i])
            if typeVariants is None:
                sys.stderr.write(f'Error parsing type variants:{options[i]}')
        cur_opt["nestedOpts"] = nestedOpts
        cur_opt["typeVariants"] = typeVariants
        options_list.append(cur_opt)

    return options_list

def parse_defaults(optionList, version:str):
    configs = next(os.walk('configs/'), (None, None, []))[2]
    configs = list(filter(lambda filename: filename.find(version)!=-1, configs))
    styles={}
    for styleFileName in configs:
        f= open(f"configs/{styleFileName}","r")
        styles[styleFileName.split("_")[1]]=yaml.safe_load(f.read())
        f.close()
    
    for optionIndex in range(len(optionList)):
        if len(optionList[optionIndex]["nestedOpts"]) == 0:
            defaults=[]
            for styleName,defaultsList in styles.items():
                if optionList[optionIndex]["name"] not in defaultsList:
                    continue
                defaults.append({"styleName":styleName,"value":defaultsList[optionList[optionIndex]["name"]]})
            optionList[optionIndex]["defaults"]=defaults
        else:
            nestedOpts=optionList[optionIndex]["nestedOpts"]
            for nestedOptIndex in range(len(nestedOpts)):
                defaults=[]
                for styleName, defaultsList in styles.items():
                    if optionList[optionIndex]["name"] not in defaultsList:
                           continue
                    defaults.append({"styleName":styleName,\
                        "value":defaultsList[optionList[optionIndex]["name"]][nestedOpts[nestedOptIndex]["name"]]})
                nestedOpts[nestedOptIndex]["defaults"]=defaults 


if __name__ == "__main__":
    if not os.getcwd().endswith("llvm"):
        sys.stderr.write("launch from llvm directory\n")
        exit(1)
    files = next(os.walk('docs/'), (None, None, []))[2]  # [] if no file
    optionList = {}
    for filename in files:
        version = filename.replace(".x.rst", "")
        current_version="clang-format-" + version
        f = open('docs/'+filename, "r")
        optionList[current_version] = parse_rst(f.read())
        parse_defaults(optionList[current_version],version)
        

    fo = open("options.json", "w")
    fo.write(json.dumps(optionList))
    fo.close()

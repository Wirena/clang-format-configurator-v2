#!/bin/python3
import re
import sys
import os
import json

#TODO: rewrite this shit

known_types = ["bool", "unsigned", "std::string", "std::vector<std::string>", "int",
               "std::vector<IncludeCategory>", "std::vector<RawStringFormat>"]


def constr_option(name: str, argType: str, docStringRst: str, typeVariants=[],
                  nestedOpts=[]):
    return {"name": name, "argType": argType, "docString": docStringRst,
            "typeVariants": typeVariants, "nestedOpts": nestedOpts}


def constr_nested_option(name: str, argType: str,typeVariant=[]):
    return {"name": name, "argType": argType,"typeVariant":typeVariant}


def parse_nested(text: str):
    # group 1 - type, group 2 - name
    matches = re.finditer(r'^  \* ``(.*?) (.*?)``', text,re.MULTILINE)
    nopts = []

    for m in matches:
        variants = []
        if m.group(1) not in known_types:
            matches1 = re.finditer(r'^    \* ``.*`` \(in configuration: ``(.*)``', text,re.MULTILINE)
            for m1 in matches1:
                variants.append(m1.group(1))
        nopts.append(constr_nested_option(m.group(2), m.group(1),variants))
    return nopts


def parse_unknown_type_variants(text: str):
    # group 1 - type variant
    matches = re.finditer(r'\* ``.*`` \(in configuration: ``(.*)``\)', text)
    return list(map(lambda m: m.group(1), matches))


def parse_based_on_style(header: str, body: str):
    # group 1 - option name, group 2 - type
    header_match = re.match(r'\*{2}(\w+)\*{2} \(``(.*)``\)',
                            header)
    variants_matches = re.finditer(r'\* ``(.*)', body)
    # return {'name': header_match.group(1), 'argType': header_match.group(2)}
    return constr_option(header_match.group(1), header_match.group(2),
                         body, list(map(lambda m: m.group(1), variants_matches)))


def rst_to_html(text: str) -> str:
    def repl(match):
        if match.group(4) is not None:
            return '<pre>'+match.group(4).replace('<',"&lt;").replace('>',"&gt;")+'</pre>'
        elif match.group(6) is not None:
            return '<p>' + match.group(6) + '</p>'


    # multiline code and paragraphs
    #  group 3 - language, group 4 - code, group 6 - paragraph
    text = re.sub(r'(?P<indent>  +)(\.\. code-block:: (.*?)\s+$)((\n|(?P=indent)  .*)+)|(^.+?\n)', repl, text,0, re.MULTILINE)
    # single line code
    text = re.sub(r'``(.+?)``', r'<code>\g<1></code>', text,0, re.MULTILINE)
    return text;


def parse_rst(rst: str):

    end_substr = ".. END_FORMAT_STYLE_OPTIONS"
    end_index = rst.find(end_substr)
    options = re.split(r'(^\*{2}\w+\*{2} \(``.*``\))', rst[0:end_index], 0, re.MULTILINE)

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
        cur_opt = constr_option(opt_header_match.group(
            1), opt_header_match.group(2), rst_to_html(options[i]))
        if opt_header_match.group(2) in known_types:
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




if __name__ == "__main__":


    filenames = next(os.walk(dir), (None, None, []))[2]  # [] if no file
    optionList = {}
    for (_, filename) in enumerate(filenames):
        f = open('docs/'+filename, "r")
        optionList[filename.replace(".rst","")]= parse_rst(f.read())
        f.close()

    fo = open("docs/options.json", "w") 
    fo.write(json.dumps(optionList))
        

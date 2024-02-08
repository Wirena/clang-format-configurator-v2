# Clang-format-configurator-v2

Interactively create a clang-format configuration while watching how the changes affect your code.

Check it out at https://clang-format-configurator.site/

Clang-format-configurator-v2 is a written from scratch successor of [clang-format-configurator](https://github.com/zed0/clang-format-configurator) with following bugs fixed and new features implemented:

- Newer clang-format versions are available
- Options show default values instead of "Default" when BasedOnStyle is selected
- Support for complex options such as arrays, BraceWrapping, IncludeCategories, RawStringFormats etc
- Readable error description on invalid option value instead of "Bad Request"
- Support for multiple programming languages
- For complex options config file is correctly(?) generated now
- Incomprehensible frontend shitcode and idiotic config generation algorithm
- Fix of critical "Not invented here" bug

## User guide
   
### Basic info

   Clang-format tool defaults all unset options to values from selected BasedOnStyle when doing formatting, this configurator follows such behaviour: every time `BasedOnStyle` is changed, all options are filled with values from selected style, when user uploads their .clang-format config file, configurator also automatically fills all unset options to match style from user's config. 
   
   Default values for enum options in dropdown selectors are marked with asterisk (*) on Firefox and with different color and italic font style on other browsers. Default values for strings and numbers are set as a placeholder (can be seen when input field is empty). Setting dropdown selectors to blank does the same thing as setting them to current style's default value.

   String selectors have "Unset" button to the right of an edit field and work this way:

   - Unset option marked with "Option unset" text and is, well, unset. It defaults to selected style
   - Active option with empty string in it is set to an empty string

   Array selectors have big red X buttons and big blue + buttons. First ones delete element above them, second ones append new empty element to the end. There are no empty arrays, because clang-format treats them the same way as unset option.

   "Autoformat on changes" checkbox is quite self explanatory, works both for code changes and option changes

   Deprecated options are placed at the bottom of the list and have strikethrough title style

   Red "overridden by X" warning means that this option value is overridden by X option value. Currently, works only for `BraceWrapping` and `BreakBeforeBraces`. If you know other options that override something, please let me know by creating an Issue. 

   Legacy values (`None, Consecutive, AcrossEmptyLines, AcrossComments, AcrossEmptyLinesAndComments`) for `AlignConsecutive*` are not supported by configurator.

### Config File page

   Well, "Upload"/"Download" buttons are for uploading/downloading config file, editor is for editing or copypasting config file contents in-place. "Close" button disgards all changes to config file, "Load Config" buttons applies them. 

   "Remove duplicates with BasedOnStyle (Not tested)" checkbox is for removing options, which values match selected BasedOnStyle style. This feature is not properly tested. 

### Diff mode

   Configurator formats code on the left/top panel, code on the right/bottom panel is left unchanged.

   Btw, if you want to make formatting as close as possible to existing formatted code, then try [clang-unformat](https://github.com/alandefreitas/clang-unformat)


## Build and Development

### Build and Run

Requirements: docker, nodejs, linux or wsl

1. Build clang-format binaries and frontend config
   
   ``llvm/prepare.sh`` script creates debian docker image, builds clang-format from source, dumps styles and copy artifacts outside of container, then launches ``llvm/build-config.py`` script 
   
   Whole process takes around 30 minutes on Intel i5 12600
   
   ```
   cd llvm
   ./prepare.sh --all
   ```
   Clang-format binaries are placed in ``server/third-party/clang-format`` direcotry, docs and defaults are in ``llvm/docs/`` and ``llvm/defaults/`` respectively and config is written into ``llvm/config.json``. ``front-end/src/config.json`` is a soft link to ``llvm/config.json``

   Install JS dependencies

   ```
   cd front-end
   npm install
   ```

2. Configure server and client
   
   - Set URL of Format endpoint in ``front-end/src/config.json`` using ``FormatApiUrl`` key, or keep ``http://localhost:8080/format?`` by default
   - Set server bind address in ``server/config.json`` using key ``bind-addr``
   - Set path to TLS key and certificate in ``server/config.json`` using keys ``certificate-file`` and ``key-file`` or leave it empty to run plain HTTP server without encryption
  
3. Run and Debug with VS Code
   
   - Run "Debug React App" to debug front-end
   - Run "Golang Remote Debug" to debug server in docker container
   - Run "Golang Local Debug" to debug server locally if you have golang installed

### Clang-format version list modification

   - List of clang-format versions is written in [TAGS](https://github.com/Wirena/clang-format-configurator-v2/blob/master/llvm/prepare.sh#L146) variable in ``llvm/prepare.sh`` script. This array holds git tag names, tag format must follow this pattern: "llvmorg-x.x.x", because ``get-version-from-tag`` extracts version string from tag name. If you want to support a version, which tag name does not follow this pattern, then modify ``get-version-from-tag`` function. Unless it works as is, idk

   - Run ``llvm/prepare.sh`` to build new version binaries and build frontend config file.

   - Then, manually modify "versions" array in backend config file ``server/config.json``.

### Config file format

   Config file format is not documented. It's generated by ``llvm/build-config.py`` script, and this script is utter shitcode. Even I don't understand how it works anymore. 

## TODOs:
   - Dark theme :heavy_check_mark:
   - Clang 17 support :heavy_check_mark:
   - Add favicon and status icon to show if code formatting is in process, succeded or failed :heavy_check_mark:
   - Indicate if option is deprecated :heavy_check_mark:
   - Let user choose whether to remove options duplicating style defaults from downloading config file or leave them as is :heavy_check_mark:
   - Add config file UI page with .clang-format file preview, to Ctrl+C/Ctrl+V file without using file explorer, like described [here](https://github.com/Wirena/clang-format-configurator-v2/issues/7)  :heavy_check_mark:
   - Fix duplicating options removal - [bug](https://github.com/Wirena/clang-format-configurator-v2/issues/21) :heavy_check_mark:
   - Preserve comments - [feature](https://github.com/Wirena/clang-format-configurator-v2/issues/21#issuecomment-1567945533)
   - Better C++ and Java code examples that show effect of selecting different formatting options
   - Code examples for Protobuf, C# and Objective C


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
- Incomprehensible front-end shitcode and idiotic config generation algorithm
- Fix of critical "Not invented here" bug

## User guide

   Every single option visible in option list is going to end up in the resulting .clang-format file.
   Previously, all duplicating with BasedOnStyle options were removed, but due to the [bug](https://github.com/Wirena/clang-format-configurator-v2/issues/21) with BraceWrapping this feature was disabled. Gonna be fixed Soon™
   
  ~~So, besides intuitive things such as config download/upload, array add/remove element buttons, options' title, documentation and selector, there is something worth mentioning.~~

   ~~The semantics of selected values is a bit different compared to the zed0's tool: the **defined** values you see is not what is written or read from your .clang-format file, but a final set of rules which ClangFormat formatting will be based on, with the exception of ``BraceWrapping`` and ``SpaceBeforeParensOptions``.~~

   ~~So, on uploading of this 4 line config~~
   ```
   ---
   BasedOnStyle: LLVM
   AlignAfterOpenBracket: DontAlign
   AlignArrayOfStructures: Right
   ```
   ~~the app will fill values not only for ``AlignAfterOpenBracket`` and ``AlignArrayOfStructures``, but every other option that is set in the specified ``BasedOnStyle``, in this case LLVM.~~

   ~~On downloading you will get the same 4 line config file, despite all options in UI have their values set.~~

   ~~Now, about the exception of ``BraceWrapping`` and ``SpaceBeforeParensOptions``. As the documentation for ``BraceWrapping``  says: *"If BreakBeforeBraces is set to BS_Custom, use this to specify how each individual brace case should be handled. Otherwise, this is ignored."* So, if you set ``BreakBeforeBraces`` to ``BS_Linux`` for example, actual ``BraceWrapping`` rules will differ from those that are displayed because I haven't found a way to get these values for each ``BreakBeforeBraces`` variant, so it works how it works.~~

   ~~I mentioned before that there are defined values, so, obviously there are undefined values. These undefined values are more of an initial design flaw than a feature. Basically, if some option is set to undefined (left blank for dropdows and numbers or greyed out for strings), then it simply won't end up in your config file. Which kinda breaks all of semantics described earlier: if ``BasedOnStyle`` is specified, then ClangFormat is setting undefined option's value to default value for selected ``BasedOnStyle``, which should be shown by the app instead of "Undefined". The default value for ``BasedOnStyle`` is LLVM. You can figure out what happens if ``BasedOnStyle`` is not specified. Yep, all undefined options fall back to LLVM style.~~



## Build and Development

Requirements: docker, nodejs, linux or wsl

1. Build clang-format binaries, dump styles and extract documentation and build config
   
   ``llvm/prepare.sh`` script is used to create debian docker image, build clang-format from source, dump styles and copy artifacts outside of container. 
   
   It takes my FX-8350 around 40 minutes to clone llvm repo and build 7 binaries. 
   
   ```
   cd llvm
   ./prepare.sh --all
   ```
   Clang-format binaries are placed in ``server/third-party/`` direcotry, docs and defaults are in ``llvm/docs/`` and ``llvm/defaults/`` respectively and config is written into ``llvm/config.json``. ``front-end/src/config.json`` is a soft link to ``llvm/config.json``

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


## TODOs:
   - Dark theme :heavy_check_mark:
   - Clang 17 support :heavy_check_mark:
   - Add favicon and status icon to show if code formatting is in process, succeded or failed :heavy_check_mark:
   - Indicate if option is deprecated :heavy_check_mark:
   - Add config file UI page with .clang-format file preview, to Ctrl+C/Ctrl+V file without using file explorer, like described [here](https://github.com/Wirena/clang-format-configurator-v2/issues/7)
   - Fix duplicating options removal - [bug](https://github.com/Wirena/clang-format-configurator-v2/issues/21)
   - Preserve comments - [feature](https://github.com/Wirena/clang-format-configurator-v2/issues/21#issuecomment-1567945533)
   - Better C++ and Java code examples that show effect of selecting different formatting options
   - Code examples for Protobuf, C# and Objective C
   - Let user choose whether to remove options duplicating style defaults from downloading config file or leave them as is 

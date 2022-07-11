# Clang-format-configurator-v2

Interactively create a clang-format configuration while watching how the changes affect your code.

Clang-format-configurator-v2 is a written from scratch successor of [clang-format-configurator](https://github.com/zed0/clang-format-configurator) with following bugs fixed and new features implemented:

- Newer clang-format versions are available
- Options show default values instead of "Default" when BasedOnStyle is selected
- Support for complex options such as BraceWrapping, IncludeCategories, RawStringFormats etc and arrays
- Readable error desription on invalid option value instead of "Bad Request"
- Support for multiple programming languages
- Correctly(?) generated config file for complex options
- Uncomprehensible front-end shitcode and idiotic config generation algorithm
- Fix of critical "Not invented here" bug

## Build and Development

Requirements: docker, nodejs

1. Build clang-format binaries, dump styles and extract documentation and build config
   
   ``llvm/prepare.sh`` script is used to create debian docker image, build clang-format from source, dump styles and copy artifacts outside of container. 
   
   It takes my FX-8350 around 40 minutes to clone llvm repo and build 7 binaries. 
   
   ```
   cd llvm
   ./prepare.sh --all
   ```
   Clang-format binaries are placed in ``server/third-party/`` direcotry, docs and defaults are in ``llvm/docs/`` and ``llvm/defaults/`` respectively and config is written into ``llvm/config.json``. ``front-end/src/config.json`` is a soft link to ``llvm/config.json``

2. Configure server and client
   
   - Set URL of Format endpoint in ``front-end/src/config.json`` using ``FormatApiUrl`` key, or keep ``http://localhost:8080/format?`` by default
   - Set server bind address in ``server/config.json`` using key ``bind-addr``
   - Set path to TLS key and certificate in ``server/config.json`` using keys ``certificate-file`` and ``key-file``
  
3. Run and Debug with VS Code
   
   - Run "Debug React App" to debug front-end
   - Run "Golang Remote Debug" to debug server in docker container
   - Run "Golang Local Debug" to debug server locally if you have golang installed

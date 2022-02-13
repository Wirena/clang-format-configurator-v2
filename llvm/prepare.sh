#!/bin/bash

LLVM_REPOSITORY_URL="https://github.com/llvm/llvm-project.git"
DOCKER_IMAGE_TAG="building_env_image:1.0"
DOCKER_CONTAINER_NAME="building_env_container"

#colors for nice output
RED="$(tput setaf 1)"
NORMAL="$(tput sgr0)"
GREEN="$(tput setaf 2)"

WORKDIR="/workdir"
#destination directory on host for clang-format binaries
BINS_DESTINATION_DIR="clang-format"
#directory in container with clang-format binaries after build
BINS_SOURCE_DIR="/workdir/clang-format"

#path on host for config file
CONFIG_DESTINATION="config.json"
#config file location in container
CONFIG_SOURCE="/workdir/config.json"

#print red error message
function echerror() {
    echo "${RED}$1 ${NORMAL}"
}

#print green stage info
function echstage() {
    echo "${GREEN}$1 ${NORMAL}"
}

function get-version-from-branch() {
    echo $1 | grep -oP '(?<=release\/)(\d+)(?=\.x)'
}

#build clang-format and config file in container
function build-artifacts() {
    echstage "Creating container"
    if ! docker inspect --format="empty" ${DOCKER_IMAGE_TAG} >/dev/null 2>&1; then
        echerror "Couldn't find image named ${DOCKER_IMAGE_TAG}"
        exit 1
    fi
    echstage "Entering container"
    docker rm --force ${DOCKER_CONTAINER_NAME} 2>/dev/null 2>&1
    if ! docker create -i --name ${DOCKER_CONTAINER_NAME} ${DOCKER_IMAGE_TAG}; then
        echerror "Failed to create container"
        exit $?
    fi
    echstage "Container script finished"
}

#run container in interactive mode
function debug-container() {
    echstage "Running container"
    docker run -it ${DOCKER_IMAGE_TAG} bash && echstage "Done" || (
        echerror "Failed to run container"
        return $?
    )

}

#copy artifacts from container to host
function copy-artifacts() {
    echstage "Copying from container"
    if ! docker cp ${DOCKER_CONTAINER_NAME}:${BINS_SOURCE_DIR} ${BINS_DESTINATION_DIR}; then
        echerror "Failed to copy compiled binaries from container"
        exit $?
    fi
    if ! docker cp ${DOCKER_CONTAINER_NAME}:${CONFIG_SOURCE} ${CONFIG_DESTINATION}; then
        echerror "Failed to copy config from container"
        exit $?
    fi
    echstage "Obtained binaries and config"
}

#build image for building
function build-image() {
    echstage "Building image"
    if ! docker build . --tag ${DOCKER_IMAGE_TAG} --progress plain; then
        echerror "Failed to build image"
        exit $?
    fi
    echstage "Finished building image"
}

function clear() {
    echstage "Clearing all"
    remove-image
    rm -rf ${BINS_DESTINATION_DIR}
    rm ${CONFIG_DESTINATION}
    echstage "Done clearing all"
}

function remove-image() {
    echstage "Removing image"
    if ! docker rmi --force ${DOCKER_IMAGE_TAG}; then
        echerror "Failed to remove image"
        exit $?
    fi
    echstage "Finished removing image"
}

#functions to run inside container
function inside-container() (
    REPOSITORY_DIR="${WORKDIR}/llvm"
    #destination for unprocessed .rst docs files
    DOCS_DIR="${WORKDIR}/docs"
    #destination for unprocessed default style configs
    DEFAULTS_DIR="${WORKDIR}/defaults"
    CORE_COUNT=$(nproc)
    declare -a BRANCHES=("release/13.x" "release/9.x")
    #eclare -a BRANCHES=("release/13.x" "release/12.x" "release/11.x" "release/10.x"
    #  "release/9.x")

    function clone-repo() {
        URL="https://github.com/llvm/llvm-project.git"

        echstage "Cloning repo"
        mkdir -p ${REPOSITORY_DIR}
        cd ${REPOSITORY_DIR}
        git init && git remote add origin ${URL} || (
            echerror "Failed to configure git repo"
            exit 1
        )

        for BRANCH in ${BRANCHES[@]}; do
            echstage "Fetching branch ${BRANCH}"
            git fetch --jobs=${CORE_COUNT} --depth=1 origin "${BRANCH}" ||
                echerror "Failed to fetch branch ${BRANCH}"
        done
        cd ${WORKDIR}
        echstage "Finished cloning repo"
    }

    function build-clang-format() {
        echstage "Starting build process"
        cd ${REPOSITORY_DIR}
        for BRANCH in ${BRANCHES[@]}; do
            VERSION_NUMBER=$(get-version-from-branch ${BRANCH})
            git checkout --force ${BRANCH}
            echstage "Building clang-format-${VERSION_NUMBER}"
            cmake -G Ninja -S llvm -B build -DCMAKE_BUILD_TYPE=MinSizeRel -DLLVM_ENABLE_PROJECTS=clang -DLLVM_ENABLE_ASSERTIONS=No &&
                cmake --build build -j${CORE_COUNT} --target clang-format || (
                echerror "Failed to build clang-format-${BRANCH}"
                continue
            )
            mkdir -p ${BINS_SOURCE_DIR} && cp --force ./build/bin/clang-format "${BINS_SOURCE_DIR}/clang-format-${VERSION_NUMBER}"
        done
        cd ${WORKDIR}
        echstage "Finished building"
    }

    function docs() {
        DOC_FILE="clang/docs/ClangFormatStyleOptions.rst"
        echstage "Copying docs"
        cd ${REPOSITORY_DIR}
        for BRANCH in ${BRANCHES[@]}; do
            VERSION_NUMBER=$(get-version-from-branch ${BRANCH})
            git checkout --force ${BRANCH} &&
                mkdir -p ${DOCS_DIR} && cp --force ${DOC_FILE} "${DOCS_DIR}/${VERSION_NUMBER}.rst" && echstage "Docs for ${BRANCH} copied" ||
                echerror "Failed to copy doc file for branch ${BRANCH}"
        done
        cd ${WORKDIR}
        echstage "Finished copying docs"
    }

    function defaults() {
        declare -a STYLES=(
            'LLVM' 'Google' 'Chromium' 'Mozilla' 'WebKit' 'Microsoft' 'GNU')
        echstage "Dumping default style configs"
        cd ${BINS_SOURCE_DIR}
        mkdir -p ${DEFAULTS_DIR}
        for FILENAME in $(find * -maxdepth 1 -type f); do
            VERSION_NUMBER=$(echo "${FILENAME}" cut -d- -f 3)
            for STYLE in ${STYLES[@]}; do
                ./${FILENAME} --style=${STYLE} --dump-config >"${DEFAULTS_DIR}/${FILENAME}_${STYLE}" ||
                    echerror "Failed to get config for style ${STYLE} for version ${FILENAME} VERSION}"
            done
        done
        cd ${WORKDIR}
        echstage "Finished dumping default style configs"
    }

    function build-config() {
        32
    }

    function all() {
        clone-repo
        build-clang-format
        docs
        defaults
    }

    if [[ "$1" = "--all" ]]; then
        all
    elif [[ "$1" = "--clone-repo" ]]; then
        clone-repo
    elif [[ "$1" = "--build-clang-format" ]]; then
        build-clang-format
    elif [[ "$1" = "--docs" ]]; then
        docs
    elif [[ "$1" = "--defaults" ]]; then
        defaults
    elif [[ "$1" = "--build-config" ]]; then
        build-artifacts
    fi
)

function all() {
    buildimage
    build-artifacts
    copy-artifacts
}

workdir="$(pwd)"
if [ "$(basename $workdir)" != "llvm" ] && [ "$1" != "--inside-container" ]; then
    echo "Run script from llvm directory"
    exit 1
fi

if [[ "$1" = "--all" ]]; then
    all
elif [[ "$1" = "--build-artifacts" ]]; then
    build-artifacts
elif [[ "$1" = "--debug-container" ]]; then
    debug-container
elif [[ "$1" = "--build-image" ]]; then
    build-image
elif [[ "$1" = "--copy-artifacts" ]]; then
    copy-artifacts
elif [[ "$1" = "--clear" ]]; then
    clear
elif [[ "$1" = "--remove-image" ]]; then
    remove-image
elif [[ "$1" = "--inside-container" ]]; then
    inside-container $2
elif [ -z "$1" ]; then
    all
else
    echo "Simply run ./prepare --all for all required stuff"
    echo "Only one option at the time"
    echo "--all:                    Build all required artifacts and copy them to host"
    echo "--build-artifacts:        Run container, build all versions of clang-format and generate config"
    echo "--build-image:            Build docker image"
    echo "--copy-artifacts:         Copy artifacts to host"
    echo "--debug-container:        Run container with interactive input"
    echo "--clear:                  Delete all artifacts"
    echo "--remove-image:           Delete image"
    echo "--inside-container: Run this script in container to build clang-format and generate config"
    echo ""
    echo "Child options for --inside-container"
    echo "  None is same as all"
    echo "  --all:                Just do everything that's required"
    echo "  --clone-repo:         Clone repository"
    echo "  --build-clang-format: Build clang-format"
    echo "  --docs:               Copy docs from repo"
    echo "  --defaults:           Dump defaults"
    echo "  --build-config        Build config from docs and defaults"
fi

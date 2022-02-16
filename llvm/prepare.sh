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
BINS_HOST_DIR="../server/third-party"
#directory in container with clang-format binaries after build
BINS_CONTAINER_DIR="/workdir/clang-format"
#destination for unprocessed .rst docs files
DOCS_DIR_CONT="${WORKDIR}/docs"
DOCS_DIR_HOST="docs"
#destination for unprocessed default style configs
DEFAULTS_DIR_CONT="${WORKDIR}/defaults"
DEFAULTS_DIR_HOST="defaults"


#path on host for config file
CONFIG_HOST="config.json"
#config file location in container
CONFIG_CONTAINTER="/workdir/config.json"

#print red error message
function echerror() {
    echo "${RED}$1 ${NORMAL}"
}

#print green stage info
function echstage() {
    echo "${GREEN}$1 ${NORMAL}"
}

function displaytime {
    local T=$1
    local D=$((T / 60 / 60 / 24))
    local H=$((T / 60 / 60 % 24))
    local M=$((T / 60 % 60))
    local S=$((T % 60))
    (($D > 0)) && printf '%d days ' $D
    (($H > 0)) && printf '%d hours ' $H
    (($M > 0)) && printf '%d minutes ' $M
    (($D > 0 || $H > 0 || $M > 0)) && printf 'and '
    printf '%d seconds\n' $S
}

function get-version-from-branch() {
    echo $1 | grep -oP '(?<=release\/)(\d+)(?=\.x)'
}

#build clang-format and config file in container
function build-artifacts() {
    if ! docker inspect --format="empty" ${DOCKER_IMAGE_TAG} 1>/dev/null 2>&1; then
        echerror "Couldn't find image named ${DOCKER_IMAGE_TAG}"
        exit 1
    fi
    echstage "Running container"
    docker rm --force ${DOCKER_CONTAINER_NAME} 1>/dev/null 2>&1
    if ! docker run -t --name ${DOCKER_CONTAINER_NAME} ${DOCKER_IMAGE_TAG} ./prepare.sh --inside-container --all; then
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
    mkdir -p ${BINS_HOST_DIR}
    if ! docker cp ${DOCKER_CONTAINER_NAME}:${BINS_CONTAINER_DIR} ${BINS_HOST_DIR}; then
        echerror "Failed to copy compiled binaries from container"
        exit $?
    else
        echo "Binaries copied"
    fi
    if ! docker cp ${DOCKER_CONTAINER_NAME}:${CONFIG_CONTAINTER} ${CONFIG_HOST}; then
        echerror "Failed to copy config from container"
        exit $?
    else
        echo "Config copied"
    fi
    if ! docker cp ${DOCKER_CONTAINER_NAME}:${DEFAULTS_DIR_CONT} ${DEFAULTS_DIR_HOST}; then
        echerror "Failed to copy defaults from container"
        exit $?
    else
        echo "Defaults copied"
    fi

    if ! docker cp ${DOCKER_CONTAINER_NAME}:${DOCS_DIR_CONT} ${DOCS_DIR_HOST}; then
        echerror "Failed to copy docs from container"
        exit $?
    else
        echo "docs copied"
    fi

    echstage "Done"
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
    rm -rf ${BINS_HOST_DIR}
    rm ${CONFIG_HOST}
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

    CORE_COUNT=$(nproc)
    declare -a BRANCHES=("release/13.x" "release/12.x" "release/11.x" "release/10.x"
        "release/9.x" "release/8.x" "release/7.x")

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
            mkdir -p ${BINS_CONTAINER_DIR} && cp --force ./build/bin/clang-format "${BINS_CONTAINER_DIR}/clang-format-${VERSION_NUMBER}"
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
                mkdir -p ${DOCS_DIR_CONT} && cp --force ${DOC_FILE} "${DOCS_DIR_CONT}/${VERSION_NUMBER}.rst" && echstage "Docs for ${BRANCH} copied" ||
                echerror "Failed to copy doc file for branch ${BRANCH}"
        done
        cd ${WORKDIR}
        echstage "Finished copying docs"
    }

    function defaults() {
        declare -a STYLES=(
            'LLVM' 'Google' 'Chromium' 'Mozilla' 'WebKit' 'Microsoft' 'GNU')
        echstage "Dumping default style configs"
        cd ${BINS_CONTAINER_DIR}
        mkdir -p ${DEFAULTS_DIR_CONT}
        for FILENAME in $(find * -maxdepth 1 -type f); do
            VERSION_NUMBER=$(echo "${FILENAME}" cut -d- -f 3)
            for STYLE in ${STYLES[@]}; do
                ./${FILENAME} --style=${STYLE} --dump-config >"${DEFAULTS_DIR_CONT}/${FILENAME}_${STYLE}" &&
                    echo "Got ${STYLE} config for ${FILENAME}" || (
                    rm "${DEFAULTS_DIR_CONT}/${FILENAME}_${STYLE}"
                    echerror "Failed to get config for style ${STYLE} for ${FILENAME}"
                )

            done
        done
        cd ${WORKDIR}
        echstage "Finished dumping default style configs"
    }

    function build-config() {
        python3 build-config.py ${DOCS_DIR_CONT} ${DEFAULTS_DIR_CONT} ${CONFIG_CONTAINTER}
    }

    function all() {
        TIME_START=$SECONDS
        clone-repo
        build-clang-format
        docs
        defaults
        build-config
        DURATION=$((SECONDS - start))
        echstage "Time taken in container:"
        displaytime ${DURATION}
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
        build-config
    fi
)

function all() {
    TIME_START=$SECONDS
    build-image
    build-artifacts
    copy-artifacts
    DURATION=$((SECONDS - start))
    echstage "Time taken in total:"
    displaytime ${DURATION}

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
